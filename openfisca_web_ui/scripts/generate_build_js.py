#! /usr/bin/env python
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


"""Outputs build.js file used by r.js in Makefile."""


import argparse
import json
import logging
import os
import sys

from openfisca_web_ui.templates import helpers


app_name = os.path.splitext(os.path.basename(__file__))[0]
log = logging.getLogger(app_name)


def main():
    parser = argparse.ArgumentParser(description = __doc__)
    parser.add_argument('-v', '--verbose', action = 'store_true', default = False, help = "increase output verbosity")
    args = parser.parse_args()
    logging.basicConfig(level = logging.DEBUG if args.verbose else logging.WARNING, stream = sys.stdout)
    requireconfig = {
        'paths': helpers.build_requireconfig_paths(static_prefix = u'../'),
        'shim': helpers.build_requireconfig_shim(),
        }
    requireconfig['paths']['appconfig'] = 'empty:'
    requireconfig.update({
        'baseUrl': 'openfisca_web_ui/static/js',
        'name': 'main',
        'out': 'openfisca_web_ui/static/js/main-built.js',
        'preserveLicenseComments': False,
        'stubModules': ['amd-loader', 'hbs', 'json', 'rv', 'text'],
        })
    print json.dumps(requireconfig, encoding = 'utf-8', ensure_ascii = False, indent = 2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
