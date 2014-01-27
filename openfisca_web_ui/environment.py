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


"""Environment configuration"""


import logging
import os
import socket
import sys

from biryani1 import strings
import pkg_resources
import pymongo
import webassets
import webassets.loaders

import openfisca_web_ui
from . import conv, model, templates


app_dir = os.path.dirname(os.path.abspath(__file__))
hostname = socket.gethostname().split('.')[0]


def configure_assets(debug = False, static_dir = None):
    """Configure WebAssets."""
    assets = webassets.Environment(static_dir, '/')
    assets.auto_build = debug
    assets.debug = debug

    # Load bundle from yaml file.
    assets_loader = webassets.loaders.YAMLLoader(pkg_resources.resource_stream(__name__, 'assets.yaml'))
    bundles = assets_loader.load_bundles()
    for name, bundle in bundles.items():
        assets.register(name, bundle)

    return assets


def load_environment(global_conf, app_conf):
    """Configure the application environment."""
    conf = openfisca_web_ui.conf  # Empty dictionary
    conf.update(strings.deep_decode(global_conf))
    conf.update(strings.deep_decode(app_conf))
    conf.update(conv.check(conv.struct(
        {
            'api.url': conv.cleanup_line,
            'api.fields.url': conv.cleanup_line,
            'app_conf': conv.set_value(app_conf),
            'app_dir': conv.set_value(app_dir),
            'app_name': conv.cleanup_line,
            'biryani1_i18n_dir': conv.pipe(
                conv.default(os.path.normpath(os.path.join(app_dir, '..', '..', 'biryani1', 'biryani1', 'i18n'))),
                conv.test(os.path.exists),
                ),
            'cache_dir': conv.default(os.path.join(os.path.dirname(app_dir), 'cache')),
            'cookie': conv.default('openfisca-web-ui'),
            'customs_dir': conv.default(None),
            'database': conv.default('openfisca_web_ui'),
            'debug': conv.pipe(conv.guess_bool, conv.default(False)),
            'global_conf': conv.set_value(global_conf),
#            'host_urls': conv.pipe(
#                conv.function(lambda host_urls: host_urls.split()),
#                conv.uniform_sequence(
#                    conv.make_input_to_url(error_if_fragment = True, error_if_path = True, error_if_query = True,
#                        full = True, schemes = (u'ws', u'wss')),
#                    constructor = lambda host_urls: sorted(set(host_urls)),
#                    ),
#                ),
            'i18n_dir': conv.default(os.path.join(app_dir, 'i18n')),
            'log_level': conv.pipe(
                conv.default('WARNING'),
                conv.function(lambda log_level: getattr(logging, log_level.upper())),
                ),
            'package_name': conv.default('openfisca-web-ui'),
            'piwik.site_id': conv.input_to_int,
            'piwik.url': conv.make_input_to_url(full = True, error_if_fragment = True, error_if_path = True,
                error_if_query = True),
            # Whether this application serves its own static files.
            'static_files': conv.pipe(conv.guess_bool, conv.default(True)),
            'static_files_dir': conv.default(os.path.join(app_dir, 'static')),
            },
        default = 'drop',
        ))(conf))

    # Configure logging.
    logging.basicConfig(level = conf['log_level'], stream = sys.stderr)

    errorware = conf.setdefault('errorware', {})
    errorware['debug'] = conf['debug']
    if not errorware['debug']:
        errorware['error_email'] = conf['email_to']
        errorware['error_log'] = conf.get('error_log', None)
        errorware['error_message'] = conf.get('error_message', 'An internal server error occurred')
        errorware['error_subject_prefix'] = conf.get('error_subject_prefix', 'OpenFisca-Web-UI Error: ')
        errorware['from_address'] = conf['from_address']
        errorware['smtp_server'] = conf.get('smtp_server', 'localhost')

    # Load MongoDB database.
    db = pymongo.Connection()[conf['database']]
    model.init(db)

    # Create the Mako TemplateLookup, with the default auto-escaping.
    templates.dirs = [os.path.join(app_dir, 'templates')]

    # Configure WebAssets.
    conf['assets'] = configure_assets(debug = conf['debug'], static_dir = conf['static_files_dir'])


def setup_environment():
    """Setup the application environment (after it has been loaded)."""

    # Setup MongoDB database.
    model.setup()
