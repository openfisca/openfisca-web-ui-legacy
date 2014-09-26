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
Add @nonTranslated tag to non-translated messages, copied from reference language file.

Since there is no gettext equivalent this script is useful.
"""


import argparse
from collections import OrderedDict
import json
import logging
import os
import re
import subprocess
import sys


app_name = os.path.splitext(os.path.basename(__file__))[0]
log = logging.getLogger(app_name)
script_dir = os.path.realpath(os.path.dirname(__file__))
i18n_dir = os.path.realpath(os.path.join(script_dir, '../static/i18n'))
js_dir = os.path.realpath(os.path.join(script_dir, '../static/js'))


def main():
    parser = argparse.ArgumentParser(description = __doc__)
    parser.add_argument('languages', help = u"JSON language files to update (without extension ex: en, fr)",
        nargs = '*')
    parser.add_argument('--all', action = 'store_true', help = u'Process all language files found')
    parser.add_argument('--no-delete-regex', help = u'Regex for keys to keep even if not extracted from source files')
    parser.add_argument('-v', '--verbose', action = 'store_true', default = False, help = u"increase output verbosity")
    args = parser.parse_args()
    logging.basicConfig(level = logging.DEBUG if args.verbose else logging.WARNING)

    if args.all:
        languages = [
            file_name[: - len('.json')]
            for file_name in os.listdir(i18n_dir)
            if file_name.endswith('.json')
            ]
    else:
        if args.languages:
            languages = args.languages
        else:
            parser.error(u'languages arguments or --all option must be given')
            return 1

    if args.no_delete_regex:
        no_delete_re = re.compile(args.no_delete_regex)

    tags = {
        'deleted': '@deleted',
        'non_translated': u'@nonTranslated',
        }
    with_tag = lambda string, tag: string if string.startswith(tag) else u'{} {}'.format(tag, string)

    extract_keys_command = u"""
grep -P -r --include='*.js' --no-filename --only-match "(?<=getIntlMessage\(\').+?(?=\'\))" {js_dir} | sort | uniq
""".strip().format(js_dir = js_dir)
    extract_keys_command_output = subprocess.check_output(extract_keys_command, shell = True)
    message_keys = extract_keys_command_output.strip().split('\n')

    for language in languages:
        language_file_path = os.path.join(i18n_dir, u'{}.json'.format(language))
        if os.path.isfile(language_file_path):
            with open(language_file_path) as language_file:
                try:
                    messages = json.load(language_file)
                except ValueError:
                    log.error(u'Error reading {}'.format(language_file_path))
                    return 1
            if '' in messages:
                print u'Error: {} contains an empty key.'.format(language_file_path).encode('utf-8')
            deleted_keys = [
                key
                for key, message in messages.iteritems()
                if key not in message_keys and not key.startswith(tags['deleted']) and (
                    not args.no_delete_regex or no_delete_re.match(key) is None
                    )
                ]
            messages = {
                with_tag(key, tags['deleted']) if key in deleted_keys else key: message
                for key, message in messages.iteritems()
                }
            new_messages = {
                key: tags['non_translated']
                for key in message_keys
                if key not in messages
                }
            messages.update(new_messages)
            messages = OrderedDict(sorted(messages.iteritems()))  # Sort keys alphabetically.
            output = json.dumps(messages, encoding = 'utf-8', ensure_ascii = False, indent = 2,
            separators = (',', ': ')).encode('utf-8')
            with open(language_file_path, 'w') as language_file:
                language_file.write(output)
                language_file.write('\n')
            print u'{}: {} messages added, {} messages marked as deleted.'.format(
                language_file_path, len(new_messages), len(deleted_keys)).encode('utf-8')
        else:
            print u'Language file {} does not exist: touch it first.'.format(language_file_path).encode('utf-8')

    return 0


if __name__ == "__main__":
    sys.exit(main())
