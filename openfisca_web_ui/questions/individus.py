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


"""Korma questions related to individus"""


from .. import uuidhelpers
from . import base


def build_default_values(index = 1):
    return {u'prenom': u'Personne {}'.format(index)}


def fill_values(values, ensure_api_compliance):
    individus = values if values else {uuidhelpers.generate_uuid(): build_default_values()}
    if ensure_api_compliance:
        # Fill values for columns without default value, setting an arbitrary value.
        for individu in individus.itervalues():
            for key, value in base.custom_column_default_values.iteritems():
                if individu.get(key) is None:
                    individu[key] = value
    return individus
