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


"""Korma questions adapted to MongoDB"""


from korma import helpers
from korma.base import Input
from korma.date import Date
from korma.repeat import Repeat as KormaRepeat

from . import conv


class Hidden(Input):
    type = u'hidden'

    @property
    def control_attributes(self):
        return helpers.merge_mappings(
            super(Hidden, self).control_attributes,
            {u'value': self.value},
        )

    @property
    def default_input_to_data(self):
        return conv.cleanup_line


class MongoDate(Date):
    @property
    def data_to_str(self):
        return conv.pipe(conv.datetime_to_date, super(MongoDate, self).data_to_str)

    @property
    def default_input_to_data(self):
        return conv.pipe(super(MongoDate, self).default_input_to_data, conv.date_to_datetime)


FrenchDate = lambda *args, **kwargs: MongoDate(format=u'%d/%m/%Y', placeholder=u'dd/mm/yyyy', *args, **kwargs)


Repeat = lambda *args, **kwargs: KormaRepeat(add_button_classes = u'add btn', add_button_label = u'Ajouter', *args,
                                             **kwargs)
