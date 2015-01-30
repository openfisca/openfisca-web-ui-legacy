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


import os
import unittest

from paste.deploy import loadapp

from .. import conf, environment


app = None


class TestCaseWithApp(unittest.TestCase):
    def setUp(self):  # noqa
        global app
        if app is None:
            conf_file_path = os.path.abspath(os.environ.get(u'PASTE_INI', u'test.ini'))
            app = loadapp(u'config:{}#main'.format(conf_file_path))
            environment.setup_environment()
        environment.db.connection.drop_database(conf['database.name'])
