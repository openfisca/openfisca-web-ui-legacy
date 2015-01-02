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


"""Middleware initialization"""


import re
import urllib

from paste.cascade import Cascade
from paste.urlparser import StaticURLParser
from weberror.errormiddleware import ErrorMiddleware
import webob

from . import conf, contexts, controllers, environment, urls


percent_encoding_re = re.compile('%[\dA-Fa-f]{2}')


def environment_setter(app):
    """WSGI middleware that sets request-dependant environment."""
    def set_environment(environ, start_response):
        req = webob.Request(environ)
        urls.application_url = req.application_url
        try:
            return app(req.environ, start_response)
        except webob.exc.WSGIHTTPException as wsgi_exception:
            return wsgi_exception(environ, start_response)

    return set_environment


def language_detector(app):
    """WSGI middleware that detects the language in requested URL"""
    lang_re = re.compile('^/(?P<lang>{languages})(?=/|$)'.format(languages = u'|'.join(conf['languages'])))

    def detect_language(environ, start_response):
        req = webob.Request(environ)
        ctx = contexts.Ctx(req)

        lang_match = lang_re.match(req.path_info)
        if lang_match is None:
            default_language = conf['languages'][0]
            ctx.lang = [default_language]
        else:
            language = lang_match.group('lang')
            ctx.lang = [language]
            req.script_name += req.path_info[:lang_match.end()]
            req.path_info = req.path_info[lang_match.end():]
        ctx.application_path_info = req.path_info

        return app(req.environ, start_response)

    return detect_language


def make_app(global_conf, **app_conf):
    """Create a WSGI application and return it

    ``global_conf``
        The inherited configuration for this application. Normally from
        the [DEFAULT] section of the Paste ini file.

    ``app_conf``
        The application's local configuration. Normally specified in
        the [app:<name>] section of the Paste ini file (where <name>
        defaults to main).
    """
    # Configure the environment and fill conf dictionary.
    environment.load_environment(global_conf, app_conf)

    # Dispatch request to controllers.
    app = controllers.make_router()

    # Init request-dependant environment
    app = language_detector(app)
    app = environment_setter(app)

    # Repair badly encoded query in request URL.
    app = request_query_encoding_fixer(app)

    # CUSTOM MIDDLEWARE HERE (filtered by error handling middlewares)

    # Handle Python exceptions
    if not conf['debug']:
        app = ErrorMiddleware(app, global_conf, **conf['errorware'])

    if conf['static_files']:
        # Serve static files
        static_app = StaticURLParser(conf['static_files_dir'])
        app = Cascade([static_app, app])

    return app


def request_query_encoding_fixer(app):
    """WSGI middleware that repairs a badly encoded query in request URL."""
    def fix_request_query_encoding(environ, start_response):
        req = webob.Request(environ)
        query_string = req.query_string
        if query_string is not None:
            try:
                urllib.unquote(query_string).decode('utf-8')
            except UnicodeDecodeError:
                req.query_string = percent_encoding_re.sub(
                    lambda match: urllib.quote(urllib.unquote(match.group(0)).decode('iso-8859-1').encode('utf-8')),
                    query_string)
        return app(req.environ, start_response)

    return fix_request_query_encoding
