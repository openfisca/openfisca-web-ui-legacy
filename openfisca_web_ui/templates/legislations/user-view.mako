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

from biryani1 import strings

from openfisca_web_ui import model, urls, uuidhelpers
%>


<%inherit file="/site.mako"/>


<%namespace name="render_legislation" file="/legislations/render-legislation.mako"/>
<%namespace name="view" file="admin-view.mako"/>


<%def name="appconfig_script()" filter="trim">
    <%render_legislation:appconfig_script/>
</%def>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
        <div class="page-header">
            <h1>${_('Legislation')} <small>${legislation.get_title(ctx)}</small></h1>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">
                <h2 class="panel-title">${legislation.get_title(ctx)}</h2>
            </div>
            <ul class="list-group">
                <li class="list-group-item">
                    <%view:view_fields/>
                </li>
                <li class="list-group-item">
                    <%view:view_content/>
                </li>
            </ul>
            <div class="panel-footer">
                <a class="btn btn-primary" href="${legislation.get_user_url(ctx, 'edit')}">
                    ${_(u'Duplicate and edit copy')}
                </a>
                <a class="btn btn-default" href="${legislation.get_api1_url(ctx, 'json')}" rel="external">
                    ${_(u'View as JSON')}
                </a>
            </div>
        </div>
</%def>


<%def name="title_content()" filter="trim">
${legislation.get_title(ctx)} - ${parent.title_content()}
</%def>
