#!/usr/bin/env python
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


"""
Update an i18n JSON file, merging the "reference" language file to it.
Add @FUZZY tag to non-translated messages, copied from reference language file.

Since there is no gettext equivalent this script is useful.
"""


import argparse
from collections import OrderedDict
import json
import logging
import os
import sys


app_name = os.path.splitext(os.path.basename(__file__))[0]
log = logging.getLogger(app_name)
script_dir = os.path.realpath(os.path.dirname(__file__))
i18n_dir = os.path.realpath(os.path.join(script_dir, '../static/i18n'))


def main():
    parser = argparse.ArgumentParser(description = __doc__)
    parser.add_argument('language', help = u"JSON language file")
    parser.add_argument('reference_language', help = u"Reference JSON language file")
    parser.add_argument('--inplace', action = 'store_true', default = False, help = u"Save language input file inplace")
    parser.add_argument('-v', '--verbose', action = 'store_true', default = False, help = u"increase output verbosity")
    args = parser.parse_args()
    logging.basicConfig(level = logging.DEBUG if args.verbose else logging.WARNING)

    language_file_path = os.path.join(i18n_dir, '{}.json'.format(args.language))
    reference_language_file_path = os.path.join(i18n_dir, '{}.json'.format(args.reference_language))
    fuzzy_tag = '@fuzzy'
    with open(reference_language_file_path) as reference_language_file:
        try:
            reference_messages = json.load(reference_language_file)
        except ValueError:
            log.error(u'Error reading {}'.format(reference_language_file_path))
            return 1
    with open(language_file_path) as language_file:
        try:
            messages = json.load(language_file)
        except ValueError:
            log.error(u'Error reading {}'.format(language_file_path))
            return 1
    messages = {
        key: message
        for key, message in messages.iteritems()
        if fuzzy_tag not in message
        }
    for key, reference_message in reference_messages.iteritems():
        if key not in messages:
            messages[key] = u'{} {}'.format(fuzzy_tag, reference_message)
    messages = OrderedDict(sorted(messages.iteritems()))  # Sort keys alphabetically.
    output = json.dumps(messages, encoding = 'utf-8', ensure_ascii = False, indent = 2,
        separators = (',', ': ')).encode('utf-8')
    if args.inplace:
        with open(language_file_path, 'w') as language_file:
            language_file.write(output)
    else:
        print(output)

    return 0


if __name__ == "__main__":
    sys.exit(main())
