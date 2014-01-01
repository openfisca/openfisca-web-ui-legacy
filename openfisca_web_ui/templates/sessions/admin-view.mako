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
from openfisca_web_ui import model, urls
%>


<%inherit file="/site.mako"/>


<%def name="breadcrumb_content()" filter="trim">
            <%parent:breadcrumb_content/>
            <li><a href="${urls.get_url(ctx, 'admin')}">${_(u"Admin")}</a></li>
            <li><a href="${model.Session.get_admin_class_url(ctx)}">${_(u"Sessions")}</a></li>
            <li class="active">${session.get_title(ctx)}</li>
</%def>


<%def name="container_content()" filter="trim">
        <h2>${session.get_title(ctx)}</h2>
        <%self:view_fields/>
        <div class="btn-toolbar">
            <a class="btn btn-danger"  href="${session.get_admin_url(ctx, 'delete')}"><span class="glyphicon glyphicon-trash"></span> ${_('Delete')}</a>
        </div>
</%def>


<%def name="title_content()" filter="trim">
${session.get_title(ctx)} - ${parent.title_content()}
</%def>


<%def name="view_fields()" filter="trim">
        <div class="field">
            <b class="field-label">${_('{0}:').format(_("Token"))}</b>
            <span class="field-value">${session.token}</span>
        </div>
<%
    user = session.user
%>\
    % if user is None:
        <div class="field">
            <b class="field-label">${_('{0}:').format(_("User ID"))}</b>
            <span class="field-value">${session.user_id}</span>
        </div>
    % else:
        <div class="field">
            <b class="field-label">${_('{0}:').format(_("User"))}</b>
            <a class="field-value" href="${user.get_admin_url(ctx)}">${user.get_title(ctx)}</span></a>
        </div>
    % endif
        <div class="field">
            <b class="field-label">${_('{0}:').format(_("Expiration Date"))}</b>
            <span class="field-value">${session.expiration.isoformat()}</span>
        </div>
</%def>

