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
import datetime

from openfisca_web_ui import model, urls
%>


<%inherit file="/admin.mako"/>


<%namespace name="view" file="/visualizations/admin-view.mako"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
<%
    user = model.get_user(ctx)
    owner_or_admin = False
    if user is not None:
        owner_or_admin = model.is_admin(ctx) or user._id == visualization.author_id
%>\
        <div class="page-header">
            <h1>${_(u'Visualization')} <small>${visualization.get_title(ctx)}</small></h1>
        </div>
        <div class="panel panel-default">
            <div class="panel-body">
                <%view:view_fields/>
    % if visualization.iframe is True:
                <%view:view_content/>
    % endif
            </div>
    % if owner_or_admin:
            <div class="panel-footer">
                <div class="btn-toolbar">
                    <a class="btn btn-default" href="${visualization.get_admin_url(ctx, 'edit')}">${_(u'Edit')}</a>
                    <a class="btn btn-danger"  href="${visualization.get_admin_url(ctx, 'delete')}">${_(u'Delete')}</a>
                </div>
            </div>
    % endif
        </div>
</%def>


<%def name="title_content()" filter="trim">
${visualization.get_title(ctx)} - ${parent.title_content()}
</%def>
