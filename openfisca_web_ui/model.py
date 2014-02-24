# -*- coding: utf-8 -*-


# OpenFisca -- A versatile microsimulation software
# By: OpenFisca Team <contact@openfisca.fr>
#
# Copyright (C) 2011, 2012, 2013, 2014 OpenFisca Team
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


"""The application's model objects"""


import collections
import datetime
import re
import requests

from biryani1 import strings

from . import conf, conv, objects, urls, wsgihelpers


_fields_api_data = None


class Account(objects.Initable, objects.JsonMonoClassMapper, objects.Mapper, objects.ActivityStreamWrapper):
    admin = False
    api_key = None
    description = None
    cnil_conditions_accepted = None
    collection_name = 'accounts'
    email = None
    full_name = None
    scenarios = None
    simulations_id = None
    current_simulation_id = None
    slug = None
    stats_accepted = None

    @classmethod
    def bson_to_json(cls, value, state = None):
        if value is None:
            return value, None
        value = value.copy()
        if value.get('draft_id') is not None:
            value['draft_id'] = unicode(value['draft_id'])
        id = value.pop('_id', None)
        if id is not None:
            value['id'] = unicode(id)
        value.pop('api_key', None)
        return value, None

    def compute_words(self):
        self.words = sorted(set(strings.slugify(u'-'.join(
            fragment
            for fragment in (
                self._id,
                self.email,
                self.full_name,
                )
            if fragment is not None
            )).split(u'-'))) or None

    @property
    def current_api_data(self):
        assert self.current_simulation is not None
        return self.current_simulation.api_data

    @property
    def current_simulation(self):
        return Simulation.find_one(self.current_simulation_id) if self.current_simulation_id is not None else None

    @current_simulation.setter
    def current_simulation(self, simulation):
        self.current_simulation_id = simulation._id

    @classmethod
    def get_admin_class_full_url(cls, ctx, *path, **query):
        return urls.get_full_url(ctx, 'admin', 'accounts', *path, **query)

    @classmethod
    def get_admin_class_url(cls, ctx, *path, **query):
        return urls.get_url(ctx, 'admin', 'accounts', *path, **query)

    def get_admin_full_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return self.get_admin_class_full_url(ctx, self.slug or self._id, *path, **query)

    def get_admin_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return self.get_admin_class_url(ctx, self.slug or self._id, *path, **query)

    def get_title(self, ctx):
        return self.full_name or self.slug or self.email or self._id

    def get_user_url(cls, ctx, *path, **query):
        return urls.get_url(ctx, 'account', *path, **query)

    def get_user_full_url(cls, ctx, *path, **query):
        return urls.get_full_url(ctx, 'account', *path, **query)

    @classmethod
    def make_id_or_slug_or_words_to_instance(cls):
        def id_or_slug_or_words_to_instance(value, state = None):
            if value is None:
                return value, None
            if state is None:
                state = conv.default_state
            id, error = conv.str_to_object_id(value, state = state)
            if error is None:
                self = cls.find_one(id, as_class = collections.OrderedDict)
            else:
                self = cls.find_one(dict(slug = value), as_class = collections.OrderedDict)
            if self is None:
                words = sorted(set(value.split(u'-')))
                instances = list(cls.find(
                    dict(
                        words = {'$all': [
                            re.compile(u'^{}'.format(re.escape(word)))
                            for word in words
                            ]},
                        ),
                    as_class = collections.OrderedDict,
                    ).limit(2))
                if not instances:
                    return value, state._(u"No account with ID, slug or words: {0}").format(value)
                if len(instances) > 1:
                    return value, state._(u"Too much accounts with words: {0}").format(u' '.join(words))
                self = instances[0]
            return self, None
        return id_or_slug_or_words_to_instance

    @property
    def simulations(self):
        return list(Simulation.find({'_id': {'$in': self.simulations_id}})) if self.simulations_id else None

    def turn_to_json_attributes(self, state):
        value, error = conv.object_to_clean_dict(self, state = state)
        if error is not None:
            return value, error
        if value.get('draft_id') is not None:
            value['draft_id'] = unicode(value['draft_id'])
        id = value.pop('_id', None)
        if id is not None:
            value['id'] = unicode(id)
        value.pop('api_key', None)
        return value, None


class Legislation(objects.Initable, objects.JsonMonoClassMapper, objects.Mapper, objects.ActivityStreamWrapper):
    author_id = None
    collection_name = u'legislations'
    datetime_begin = None
    datetime_end = None
    description = None
    json = None
    slug = None
    title = None
    url = None

    @classmethod
    def bson_to_json(cls, value, state = None):
        if value is None:
            return value, None
        value = value.copy()
        if value.get('draft_id') is not None:
            value['draft_id'] = unicode(value['draft_id'])
        id = value.pop('_id', None)
        if id is not None:
            value['id'] = unicode(id)
        return value, None

    def compute_words(self):
        self.words = sorted(set(strings.slugify(u'-'.join(
            fragment
            for fragment in (
                unicode(self._id),
                self.description,
                self.title,
                )
            if fragment is not None
            )).split(u'-'))) or None

    @classmethod
    def get_admin_class_full_url(cls, ctx, *path, **query):
        return urls.get_full_url(ctx, 'admin', 'legislations', *path, **query)

    @classmethod
    def get_admin_class_url(cls, ctx, *path, **query):
        return urls.get_url(ctx, 'admin', 'legislations', *path, **query)

    def get_admin_full_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return self.get_admin_class_full_url(ctx, self.slug or self._id, *path, **query)

    def get_admin_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return self.get_admin_class_url(ctx, self.slug or self._id, *path, **query)

    def get_api1_full_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return urls.get_full_url(ctx, 'api', '1', 'legislations', self.slug or self._id, *path, **query)

    def get_api1_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return urls.get_url(ctx, 'api', '1', 'legislations', self.slug or self._id, *path, **query)

    @classmethod
    def get_class_full_url(cls, ctx, *path, **query):
        return urls.get_full_url(ctx, 'legislations', *path, **query)

    @classmethod
    def get_class_url(cls, ctx, *path, **query):
        return urls.get_url(ctx, 'legislations', *path, **query)

    def get_full_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return self.get_class_full_url(ctx, self.slug or self._id, *path, **query)

    def get_title(self, ctx):
        return self.title or self.slug or self._id

    def get_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return self.get_class_url(ctx, self.slug or self._id, *path, **query)

    def get_user(self, ctx):
        if self._user is UnboundLocalError:
            self._user = Account.find_one(self.user_id) if self.user_id is not None else None
        return self._user

    @classmethod
    def get_user_class_full_url(cls, ctx, *path, **query):
        return urls.get_full_url(ctx, 'legislations', *path, **query)

    @classmethod
    def get_user_class_url(cls, ctx, *path, **query):
        return urls.get_url(ctx, 'legislations', *path, **query)

    def get_user_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return self.get_user_class_url(ctx, self.slug or self._id, *path, **query)

    @classmethod
    def make_id_or_slug_or_words_to_instance(cls):
        def id_or_slug_or_words_to_instance(value, state = None):
            if value is None:
                return value, None
            if state is None:
                state = conv.default_state
            id, error = conv.str_to_object_id(value, state = state)
            if error is None:
                self = cls.find_one(id, as_class = collections.OrderedDict)
            else:
                self = cls.find_one(dict(slug = value), as_class = collections.OrderedDict)
            if self is None:
                words = sorted(set(value.split(u'-')))
                instances = list(cls.find(
                    dict(
                        words = {'$all': [
                            re.compile(u'^{}'.format(re.escape(word)))
                            for word in words
                            ]},
                        ),
                    as_class = collections.OrderedDict,
                    ).limit(2))
                if not instances:
                    return value, state._(u"No legislation with ID, slug or words: {0}").format(value)
                if len(instances) > 1:
                    return value, state._(u"Too much legislations with words: {0}").format(u' '.join(words))
                self = instances[0]
            return self, None
        return id_or_slug_or_words_to_instance

    def turn_to_json_attributes(self, state):
        value, error = conv.object_to_clean_dict(self, state = state)
        if error is not None:
            return value, error
        if value.get('draft_id') is not None:
            value['draft_id'] = unicode(value['draft_id'])
        id = value.pop('_id', None)
        if id is not None:
            value['id'] = unicode(id)
        return value, None


class Session(objects.JsonMonoClassMapper, objects.Mapper, objects.SmartWrapper):
    _user = UnboundLocalError
    collection_name = 'sessions'
    disclaimer_closed = None
    expiration = None
    token = None  # the cookie token
    user_id = None

    @classmethod
    def get_admin_class_full_url(cls, ctx, *path, **query):
        return urls.get_full_url(ctx, 'admin', 'sessions', *path, **query)

    @classmethod
    def get_admin_class_url(cls, ctx, *path, **query):
        return urls.get_url(ctx, 'admin', 'sessions', *path, **query)

    def get_admin_full_url(self, ctx, *path, **query):
        if self.token is None:
            return None
        return self.get_admin_class_full_url(ctx, self.token, *path, **query)

    def get_admin_url(self, ctx, *path, **query):
        if self.token is None:
            return None
        return self.get_admin_class_url(ctx, self.token, *path, **query)

    def get_title(self, ctx):
        user = self.user
        if user is None:
            return ctx._(u'Session {0}').format(self.token)
        return ctx._(u'Session {0} of {1}').format(self.token, user.get_title(ctx))

    @classmethod
    def remove_expired(cls, ctx):
        for self in cls.find(
                dict(expiration = {'$lt': datetime.datetime.utcnow()}),
                as_class = collections.OrderedDict,
                ):
            self.delete()

    def to_bson(self):
        self_bson = self.__dict__.copy()
        self_bson.pop('_user', None)
        return self_bson

    @property
    def user(self):
        if self._user is UnboundLocalError:
            self._user = Account.find_one(self.user_id) if self.user_id is not None else None
        return self._user

    @user.setter
    def user(self, user):
        self._user = user
        self.user_id = user._id

    @classmethod
    def uuid_to_instance(cls, value, state = None):
        if value is None:
            return value, None
        if state is None:
            state = conv.default_state

        # First, delete expired sessions.
        cls.remove_expired(state)

        self = cls.find_one(dict(token = value), as_class = collections.OrderedDict)
        if self is None:
            return value, state._(u"No session with UUID {0}").format(value)
        return self, None


class Simulation(objects.Initable, objects.JsonMonoClassMapper, objects.Mapper, objects.ActivityStreamWrapper):
    api_data = None
    author_id = None
    collection_name = 'simulations'
    description = None
    slug = None
    title = None

    @classmethod
    def bson_to_json(cls, value, state = None):
        if value is None:
            return value, None
        value = value.copy()
        if value.get('draft_id') is not None:
            value['draft_id'] = unicode(value['draft_id'])
        id = value.pop('_id', None)
        if id is not None:
            value['id'] = unicode(id)
        return value, None

    def compute_words(self):
        self.words = sorted(set(strings.slugify(u'-'.join(
            fragment
            for fragment in (
                self._id,
                self.description,
                self.title,
                )
            if fragment is not None
            )).split(u'-'))) or None

    @classmethod
    def get_class_url(cls, ctx, *path, **query):
        return urls.get_url(ctx, 'simulations', *path, **query)

    @classmethod
    def get_class_full_url(cls, ctx, *path, **query):
        return urls.get_full_url(ctx, 'simulations', *path, **query)

    def get_full_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return urls.get_full_url(ctx, 'simulations', self.slug or self._id, *path, **query)

    def get_url(self, ctx, *path, **query):
        if self._id is None and self.slug is None:
            return None
        return urls.get_url(ctx, 'simulations', self.slug or self._id, *path, **query)

    def get_title(self, ctx):
        return self.full_name or self.slug or self.email or self._id

    @classmethod
    def make_id_or_slug_or_words_to_instance(cls, user_id = None):
        def id_or_slug_or_words_to_instance(value, state = None):
            if value is None:
                return value, None
            if state is None:
                state = conv.default_state
            id, error = conv.str_to_object_id(value, state = state)
            if error is None:
                self = cls.find_one(dict(_id = id), as_class = collections.OrderedDict)
            else:
                self = cls.find_one(dict(slug = value, author_id = user_id), as_class = collections.OrderedDict)
            if self is None:
                words = sorted(set(value.split(u'-')))
                instances = list(cls.find(
                    dict(
                        words = {'$all': [
                            re.compile(u'^{}'.format(re.escape(word)))
                            for word in words
                            ]},
                        ),
                    as_class = collections.OrderedDict,
                    ).limit(2))
                if not instances:
                    return value, state._(u"No simulation with ID, slug or words: {0}").format(value)
                if len(instances) > 1:
                    return value, state._(u"Too much simulations with words: {0}").format(u' '.join(words))
                self = instances[0]
            return self, None
        return id_or_slug_or_words_to_instance

    def turn_to_json_attributes(self, state):
        value, error = conv.object_to_clean_dict(self, state = state)
        if error is not None:
            return value, error
        if value.get('draft_id') is not None:
            value['draft_id'] = unicode(value['draft_id'])
        id = value.pop('_id', None)
        if id is not None:
            value['id'] = unicode(id)
        value.pop('api_key', None)
        return value, None


class Status(objects.Mapper, objects.Wrapper):
    collection_name = 'status'
    last_upgrade_name = None


def configure(ctx):
    pass


def fetch_fields_api_data():
    global _fields_api_data
    try:
        response = requests.get(conf['api.urls.fields'])
    except requests.exceptions.ConnectionError:
        return
    except requests.exceptions.HTTPError:
        return
    if response.ok:
        _fields_api_data = response.json()


def fields_api_data():
    if _fields_api_data is None:
        fetch_fields_api_data()
    return _fields_api_data


def find_category_name(column_name, entity_name):
    """For a given column, find its category name."""
    entity_categories = fields_api_data()['columns_tree'][entity_name]['children']
    for entity_category in entity_categories:
        if column_name in entity_category['children']:
            return strings.slugify(entity_category['label'], separator = '_')
    return None


def get_user(ctx, check = False):
    user = ctx.user
    if user is UnboundLocalError:
        session = ctx.session
        ctx.user = user = session.user if session is not None else None
    if user is None and check:
        raise wsgihelpers.unauthorized(ctx)
    return user


def init(db):
    objects.Wrapper.db = db


def is_admin(ctx, check = False):
    user = get_user(ctx)
    if user is None or user.email is None:
        if check:
            raise wsgihelpers.forbidden(ctx,
                message = ctx._(u"You must be authenticated as an administrator to access this page."))
        return False
    if not user.admin:
        if Account.find_one(dict(admin = True), []) is None:
            # Whem there is no admin, every logged user is an admin.
            return True
        if check:
            raise wsgihelpers.forbidden(ctx, message = ctx._(u"You must be an administrator to access this page."))
        return False
    return True


def setup():
    """Setup MongoDb database."""
    from . import upgrades
    import imp
    import os

    upgrades_dir = os.path.dirname(upgrades.__file__)
    upgrades_name = sorted(
        os.path.splitext(upgrade_filename)[0]
        for upgrade_filename in os.listdir(upgrades_dir)
        if upgrade_filename.endswith('.py') and upgrade_filename != '__init__.py'
        )
    status = Status.find_one(as_class = collections.OrderedDict)
    if status is None:
        status = Status()
        if upgrades_name:
            status.last_upgrade_name = upgrades_name[-1]
        status.save()
    else:
        for upgrade_name in upgrades_name:
            if status.last_upgrade_name is None or status.last_upgrade_name < upgrade_name:
                print 'Upgrading "{0}"'.format(upgrade_name)
                upgrade_file, upgrade_file_path, description = imp.find_module(upgrade_name, [upgrades_dir])
                try:
                    upgrade_module = imp.load_module(upgrade_name, upgrade_file, upgrade_file_path, description)
                finally:
                    if upgrade_file:
                        upgrade_file.close()
                upgrade_module.upgrade(status)

    Account.ensure_index('admin', sparse = True)
    Account.ensure_index('api_key', sparse = True, unique = True)
    Account.ensure_index('email', unique = True)
    Account.ensure_index('slug', unique = True)
    Account.ensure_index('updated')
    Account.ensure_index('words')

#    Legislation.ensure_index('slug', unique = True)
    Legislation.ensure_index('updated')
    Legislation.ensure_index('words')

    Session.ensure_index('expiration')
    Session.ensure_index('token', unique = True)
