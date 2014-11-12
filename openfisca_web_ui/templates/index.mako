## -*- coding: utf-8 -*-


## OpenFisca -- A versatile microsimulation software
## By: OpenFisca Team <contact@openfisca.fr>
##
## Copyright (C) 2011, 2012, 2013, 2014 OpenFisca Team
## https://github.com/openfisca
##
## This file is part of OpenFisca.
##
## OpenFisca is free software; you can redistribute it and/or modify
## it under the terms of the GNU Affero General Public License as
## published by the Free Software Foundation, either version 3 of the
## License, or (at your option) any later version.
##
## OpenFisca is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU Affero General Public License for more details.
##
## You should have received a copy of the GNU Affero General Public License
## along with this program.  If not, see <http://www.gnu.org/licenses/>.


<%!
from openfisca_web_ui import conf, model, urls
from openfisca_web_ui.templates import helpers
%>


<%inherit file="site.mako"/>


<%def name="appconfig_script()" filter="trim">
window.appconfig = ${helpers.index_appconfig(ctx, alert_on_js_error = data['alert_on_js_error']) | n, js};
</%def>


<%def name="breadcrumb_content()" filter="trim">
    <li><a href="${conf['urls.www']}">${_(u'Home')}</a></li>
    <li class="active">
        ${_(u'Demonstrator')}
        <span class="label label-warning">${_(u'debug') if conf['debug'] else _(u'beta')}</span>
    </li>
</%def>


<%def name="container_content()" filter="trim">
<div id="simulator-container">
    <p>${_('Loading demonstrator...')}</p>
</div>
</%def>


<%def name="page_css()" filter="trim">
    <link href="${urls.get_url(ctx, u'css/typeahead.css', static = True)}" media="screen" rel="stylesheet">
</%def>


<%def name="page_scripts()" filter="trim">
% if conf['enabled.auth']:
    ## Quote from persona: You must include this on every page which uses navigator.id functions.
    ## Because Persona is still in development, you should not self-host the include.js file.
    <script src="${urlparse.urljoin(conf['urls.persona'], 'include.js')}"></script>
% endif
    <script src="${urls.get_url(ctx, u'dist/vendor/lazy.js', static = True)}"></script>
    <script src="${urls.get_url(ctx, u'dist/vendor/react-with-addons.min.js', static = True)}"></script>
    <script src="${urls.get_url(ctx, u'dist/vendor/intl/Intl.min.js', static = True)}"></script>
    <script src="${urls.get_url(ctx, u'dist/vendor/intl/locale-data/jsonp/{}.js'.format(ctx.lang[0]), static = True)}"></script>
    <script src="${urls.get_url(ctx, u'dist/vendor/react-intl/react-intl.min.js', static = True)}"></script>
    <script src="${urls.get_url(ctx, u'dist/vendor/react-intl/locale-data/{}.js'.format(ctx.lang[0]), static = True)}"></script>
    <script src="${urls.get_url(ctx, u'dist/vendor/traceur-runtime.js', static = True)}"></script>
    <script>
        <%self:appconfig_script/>
    </script>
    <script src="${urls.get_url(ctx, u'dist/' + ('bundle.min.js' if data['minified_js_bundle'] else u'bundle.js'), static = True)}"></script>
</%def>
