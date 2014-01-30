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
from openfisca_web_ui import pages
%>

<%inherit file="site.mako"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="tabs()" filter="trim">
    <ul class="nav nav-tabs">
    % for page_data in pages.pages_data:
      <li${u' class="active"' if req.urlvars['page_data']['slug'] == page_data['slug'] else u'' | n}>
        <a href="${u'/{}'.format(page_data['slug'])}">${page_data['title']}</a>
      </li>
    % endfor
    </ul>
</%def>


<%def name="container_content()" filter="trim">
    <h1>${req.urlvars['page_data']['title']}</h1>
    <%self:tabs/>
</%def>


<%def name="scripts()" filter="trim">
    <%parent:scripts/>
    <script>
requirejs.config({
  paths : {
    domReady: '/bower/requirejs-domready/domReady',
    jquery: '/bower/jquery/jquery',
    modernizr: '/bower/modernizr/modernizr',
    myClass: '/bower/my-class/my.class'
  }
});
define(
  'config',
${page_form.full_javascript_config | n, js}
);
require(['/js/main.js']);
    </script>
</%def>