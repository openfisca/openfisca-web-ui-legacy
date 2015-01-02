## -*- coding: utf-8 -*-


## OpenFisca -- A versatile microsimulation software
## By: OpenFisca Team <contact@openfisca.fr>
##
## Copyright (C) 2011, 2012, 2013, 2014, 2015 OpenFisca Team
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
import babel.dates

from openfisca_web_ui import model, urls
%>


<%inherit file="/admin.mako"/>


<%def name="breadcrumb_content()" filter="trim">
            <%parent:breadcrumb_content/>
            <li><a href="${urls.get_url(ctx, 'admin')}">${_(u"Admin")}</a></li>
            <li><a href="${model.Session.get_admin_class_url(ctx)}">${_(u"Sessions")}</a></li>
            <li class="active">${session.get_title(ctx)}</li>
</%def>


<%def name="container_content()" filter="trim">
        <div class="page-header">
            <h1>${_(u'Session')} <small>${session.get_title(ctx)}</small></h1>
        </div>
        <div class="panel panel-default">
            <div class="panel-body">
                <%self:view_fields/>
            </div>
            <div class="panel-footer">
                <div class="btn-toolbar">
                    <a class="btn btn-danger" href="${session.get_admin_url(ctx, 'delete')}">${_(u'Delete')}</a>
                </div>
            </div>
        </div>
</%def>


<%def name="title_content()" filter="trim">
${session.get_title(ctx)} - ${parent.title_content()}
</%def>


<%def name="view_fields()" filter="trim">
        <dl class="dl-horizontal">
            <dt>${_(u'Token')}</dt>
            <dd>${session.token}</dd>
<%
    user = session.user
%>\
    % if user is None:
            <dt>${_(u'User ID')}</dt>
            <dd>${session.user_id}</dd>
    % else:
            <dt>${_(u'User')}</dt>
            <dd><a href="${user.get_admin_url(ctx)}">${user.get_title(ctx)}</a></dd>
    % endif
            <dt>${_(u'Expiration Date')}</dt>
            <dd>${babel.dates.format_datetime(session.expiration) if session.expiration is not None else ''}</dd>
        </dl>
</%def>

