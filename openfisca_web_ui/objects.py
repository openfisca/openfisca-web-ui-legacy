# -*- coding: utf-8 -*-


# OpenFisca -- A versatile microsimulation software
# By: OpenFisca Team <contact@openfisca.fr>
#
# Copyright (C) 2011, 2012, 2013, 2014, 2015 OpenFisca Team
# https://github.com/openfisca
#
# This file is part of OpenFisca.
#
# OpenFisca is free software; you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# OpenFisca is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


"""Base mixins for objects"""


import collections
import datetime

from bson import objectid
import pymongo

from . import conv


# Level-1 Classes


class Cursor(pymongo.cursor.Cursor):
    """A MongoDB cursor that returns mapped documents instead of BSON documents"""
    document_class = None

    def __getitem__(self, index):
        doc = super(Cursor, self).__getitem__(index)
        if isinstance(doc, dict):
            return self.document_class.from_bson(doc)
        else:
            return doc

    def clone(self):
        clone = super(Cursor, self).clone()
        clone.__class__ = self.__class__
        clone.document_class = self.document_class
        return clone

    def next(self):
        next = super(Cursor, self).next()
        return self.document_class.from_bson(next)


class Initable(object):
    def __init__(self, **attributes):
        if attributes:
            self.set_attributes(**attributes)

    def set_attributes(self, **attributes):
        """Set given attributes and return a boolean stating whether existing attributes have changed."""
        changed = False
        for name, value in attributes.iteritems():
            if value is getattr(self.__class__, name, UnboundLocalError):
                if value is not getattr(self, name, UnboundLocalError):
                    delattr(self, name)
                    changed = True
            elif value is not getattr(self, name, UnboundLocalError):
                setattr(self, name, value)
                changed = True
        return changed


class JsonMonoClassMapper(object):
    @property
    def attributes_to_json(self):
        return conv.pipe(
            self.rename_attribute_to_json_items,
            conv.struct(
                self.get_attribute_to_json_converters(),
                default = conv.noop,
                skip_missing_items = True,
                ),
            )

    @classmethod
    def from_json(cls, bson, state = None):
        return conv.check(cls.json_to_instance)(bson, state = state or conv.default_state)

    def get_attribute_to_json_converters(self):
        return {}

    @classmethod
    def get_json_to_attribute_converters(cls):
        return {}

    @classmethod
    def json_dict_to_attributes(cls, value, state = None):
        if state is None:
            state = conv.default_state
        return conv.pipe(
            conv.struct(
                cls.get_json_to_attribute_converters(),
                # default = None,  # For security reasons, don't accept JSON items without converters.
                skip_missing_items = True,
                ),
            cls.json_dict_to_attributes_phase2,
            cls.rename_json_to_attribute_items,
            )(value, state = state)

    @classmethod
    def json_dict_to_attributes_phase2(cls, value, state = None):
        return value, None

    @classmethod
    def json_to_instance(cls, value, state = None):
        if value is None:
            return value, None
        if state is None:
            state = conv.default_state
        if not isinstance(value, dict):
            return value, state._(u'Expected a dictionary. Got {0}').format(type(value))
        self, error = conv.pipe(
            cls.json_dict_to_attributes,
            conv.make_dict_to_object(cls),
            )(value, state = state)
        if error is not None:
            return self, error
        return self.terminate_json_to_instance(state = state)

    @classmethod
    def rename_attribute_to_json_items(cls, value, state = None):
        return value, None

    @classmethod
    def rename_json_to_attribute_items(cls, value, state = None):
        return value, None

    def terminate_json_to_instance(self, state = None):
        return self, None

    def to_json(self, state = None):
        return conv.check(conv.method('turn_to_json'))(self, state = state or conv.default_state)

    def turn_to_json(self, state):
        return conv.pipe(
            conv.method('turn_to_json_attributes'),
            self.attributes_to_json,
            )(self, state = state)

    def turn_to_json_attributes(self, state):
        return conv.object_to_clean_dict(self, state = state)


class Mapper(object):
    """Mixin that implements a very minimal MongoDB object mapper

    Most of the times, the mapper should be written from scratch instead of heriting form this class.
    """

    @classmethod
    def from_bson(cls, bson):
        if bson is None:
            return None
        self = cls()
        # Don't use "self.__dict__ = bson" to ensure that __dict__ is not an OrderedDict, because setattr doesn't work
        # for OrderedDict.
        self.__dict__ = dict(bson)
        return self

    def to_bson(self):
        return self.__dict__


class Wrapper(object):
    """Mixin that wraps MongoDB commands

    Use it in conjuction with a document mapper mixin.
    """
    _collection = None  # class attribute used as cache for class method get_collection()
    _id = None
    collection_name = None  # class constant to override
    db = None

    @classmethod
    def count(cls):
        return cls.get_collection().count()

    def delete(self, *args, **kwargs):
        id = self._id
        assert id is not None
        self.remove(id, *args, **kwargs)
        del self._id  # Mark as deleted.
        return id

    @classmethod
    def distinct(cls, *args, **kwargs):
        return cls.get_collection().distinct(*args, **kwargs)

    @classmethod
    def drop_index(cls, *args, **kwargs):
        return cls.get_collection().drop_index(*args, **kwargs)

    @classmethod
    def drop_indexes(cls, *args, **kwargs):
        return cls.get_collection().drop_indexes(*args, **kwargs)

    @classmethod
    def ensure_index(cls, *args, **kwargs):
        return cls.get_collection().ensure_index(*args, **kwargs)

    @classmethod
    def find(cls, *args, **kwargs):
        cursor = cls.get_collection().find(*args, **kwargs)
        assert cursor.__class__ is pymongo.cursor.Cursor
        cursor.__class__ = Cursor
        cursor.document_class = cls
        return cursor

    @classmethod
    def find_one(cls, *args, **kwargs):
        return cls.from_bson(cls.get_collection().find_one(*args, **kwargs))

    @classmethod
    def get_collection(cls):
        collection = cls.__dict__.get('_collection')
        if collection is None:
            assert cls.db is not None, 'Missing db in class %s' % cls
            collection_name = cls.get_collection_name()
            assert collection_name is not None, 'Missing mongo collection name in class %s' % cls
            cls._collection = collection = cls.db[collection_name]
        return collection

    @classmethod
    def get_collection_name(cls):
        return cls.collection_name

    @classmethod
    def group(cls, *args, **kwargs):
        return cls.get_collection().group(*args, **kwargs)

    @classmethod
    def index_information(cls, *args, **kwargs):
        return cls.get_collection().index_information(*args, **kwargs)

    @classmethod
    def map_reduce(cls, *args, **kwargs):
        return cls.get_collection().map_reduce(*args, **kwargs)

    @classmethod
    def remove(cls, *args, **kwargs):
        return cls.get_collection().remove(*args, **kwargs)

    def save(self, *args, **kwargs):
        # Since to_bson may return a copy of object's __dict__, we need to add _id to original object.
        bson = self.to_bson() or {}
        result = self.get_collection().save(bson, *args, **kwargs)
        if self._id is None:
            assert bson['_id'] is not None
            self._id = bson['_id']
        return result

    @classmethod
    def update(cls, *args, **kwargs):
        return cls.get_collection().update(*args, **kwargs)


# Level-2 Classes


class SmartWrapper(Wrapper):
    draft_id = None

    def after_delete(self, old_bson):
        pass

    def before_delete(self, old_bson):
        pass

    def after_upsert(self, old_bson, bson):
        pass

    def before_compare(self, old_bson, bson):
        bson['draft_id'] = old_bson['draft_id']

    def before_upsert(self, old_bson, bson):
        self.draft_id = bson['draft_id'] = objectid.ObjectId()

    def delete(self, *args, **kwargs):
        id = self._id
        assert id is not None
        old_bson = self.get_collection().find_one(id, as_class = collections.OrderedDict)
        if old_bson is not None:
            self.before_delete(old_bson)
            old_bson = dict(old_bson)
            self.remove(id, *args, **kwargs)
            self.after_delete(old_bson)
        del self._id  # Mark as deleted.
        return id

    def save(self, *args, **kwargs):
        # Override the dafault save method to return True when bson has changed and False otherwise.
        # Since to_bson may return a copy of account's __dict__, we need to add _id to original object.
        bson = self.to_bson() or {}
        collection = self.get_collection()
        id = bson.get('_id')
        if id is None:
            old_bson = None
        else:
            old_bson = collection.find_one(id, as_class = collections.OrderedDict)
            if old_bson is not None:
                old_bson = dict(old_bson)
                self.before_compare(old_bson, bson)
                if bson == old_bson:
                    return False
        self.before_upsert(old_bson, bson)
        collection.save(bson, *args, **kwargs)
        if id is None:
            self._id = bson['_id']
        self.after_upsert(old_bson, bson)
        return True


# Level-3 Classes


class ActivityStreamWrapper(SmartWrapper):
    published = None
    updated = None
    words = None

    def before_compare(self, old_bson, bson):
        super(ActivityStreamWrapper, self).before_compare(old_bson, bson)
        bson['published'] = old_bson['published']
        bson['updated'] = old_bson['updated']

    def before_upsert(self, old_bson, bson):
        super(ActivityStreamWrapper, self).before_upsert(old_bson, bson)
        self.updated = bson['updated'] = updated = datetime.datetime.utcnow()
        if self.published is None:
            self.published = bson['published'] = updated
