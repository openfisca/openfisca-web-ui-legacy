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


<%inherit file="/object-admin-index.mako"/>


<%def name="breadcrumb_content()" filter="trim">
            <%parent:breadcrumb_content/>
            <li><a href="${urls.get_url(ctx, 'admin')}">${_(u"Admin")}</a></li>
            <li class="active">${_(u'Sessions')}</li>
</%def>


<%def name="container_content()" filter="trim">
    % if pager.item_count == 0:
        <h2>${_(u"No session found")}</h2>
    % else:
        % if pager.page_count > 1:
            % if pager.page_size == 1:
        <h2>${_(u"Session {0} of {1}").format(pager.first_item_number, pager.item_count)}</h2>
            % else:
        <h2>${_(u"Sessions {0} - {1} of {2}").format(pager.first_item_number, pager.last_item_number, pager.item_count)}</h2>
            % endif
        % elif pager.item_count == 1:
        <h2>${_(u"Single session")}</h2>
        % else:
        <h2>${_(u"{} sessions").format(pager.item_count)}</h2>
        % endif
        <%self:pagination object_class="${model.Session}" pager="${pager}"/>
        <table class="table table-bordered table-condensed table-striped">
            <thead>
                <tr>
                    <th>${_(u"Token")}</th>
                    <th>${_(u"User")}</th>
                    <th>${_(u"Expiration Date")}</th>
                </tr>
            </thead>
            <tbody>
        % for session in sessions:
                <tr>
                    <td><a href="${session.get_admin_url(ctx)}">${session.token}</a></td>
<%
            user = session.user
%>\
            % if user is None:
                    <td>${session.user_id}</td>
            % else:
                    <td>${user.get_title(ctx)}</td>
            % endif
                    <td>${session.expiration.isoformat() if session.expiration is not None else ''}</td>
                </tr>
        % endfor
            </tbody>
        </table>
        <%self:pagination object_class="${model.Session}" pager="${pager}"/>
    % endif
</%def>


<%def name="title_content()" filter="trim">
${_('Sessions')} - ${parent.title_content()}
</%def>
