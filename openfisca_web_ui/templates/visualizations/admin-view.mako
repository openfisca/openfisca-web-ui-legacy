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
import urllib

from openfisca_web_ui import model, urls
%>


<%inherit file="/admin.mako"/>


<%def name="breadcrumb_content()" filter="trim">
            <%parent:breadcrumb_content/>
            <li><a href="${urls.get_url(ctx, 'admin')}">${_(u"Admin")}</a></li>
            <li><a href="${model.Visualization.get_admin_class_url(ctx)}">${_(u"Visualizations")}</a></li>
            <li class="active">${visualization.get_title(ctx)}</li>
</%def>


<%def name="container_content()" filter="trim">
<%
    user = model.get_user(ctx, check = True)
    owner_or_admin = model.is_admin(ctx) or user._id == visualization.author_id
%>\
        <div class="page-header">
            <h1>${_('Visualization')} <small>${visualization.get_title(ctx)}</small></h1>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2 class="panel-title">
    % if owner_or_admin:
                    <a class="btn btn-default btn-sm" href="${visualization.get_admin_url(ctx, 'edit')}">
                        <span class="glyphicon glyphicon-cog"></span>
                    </a>
    % endif:
                    ${visualization.get_title(ctx)}
                </h2>
            </div>
            <ul class="list-group">
                <li class="list-group-item">
                    <%self:view_fields/>
                </li>
                <li class="list-group-item">
                    <%self:view_content/>
                </li>
            </ul>
    % if owner_or_admin:
            <div class="panel-footer">
                <div class="btn-toolbar">
                    <a class="btn btn-danger"  href="${visualization.get_admin_url(ctx, 'delete')}">
                        <span class="glyphicon glyphicon-trash"></span> ${_('Delete')}
                    </a>
                </div>
            </div>
    % endif
        </div>
</%def>


<%def name="title_content()" filter="trim">
${visualization.get_title(ctx)} - ${parent.title_content()}
</%def>


<%def name="view_content()" filter="trim">
<%
    value = visualization.url
    if value is None:
        return ''
    simulation_url = urllib.quote('{}?{}'.format(
        urls.get_full_url(ctx, 'api/1/simulate'),
        urllib.urlencode({'token': ctx.session.anonymous_token}),
        ))
%>\
        <iframe class="visualization-iframe" src="${value.format(simulation_url = simulation_url)}"></iframe>
</%def>


<%def name="view_fields()" filter="trim">
        <dl class="dl-horizontal">
<%
    value = visualization.description
%>\
    % if value is not None:
            <dt>${_("Description")}</dt>
            <dd>${value}</dd>
    % endif
<%
    simulation_url = urllib.quote('{}?{}'.format(
        urls.get_full_url(ctx, 'api/1/simulate'),
        urllib.urlencode({'token': ctx.session.anonymous_token}),
        ))
    value = visualization.url
%>\
    % if value is not None:
            <dt>${_("Source URL")}</dt>
            <dd><a href="${value.format(simulation_url = simulation_url)}">${value}</a></dd>
    % endif
<%
    value = visualization.enabled
%>\
    % if value is not None:
            <dt>${_("Enabled")}</dt>
            <dd>${_("Yes") if value else _("No")}</dd>
    % endif
<%
    value = visualization.featured
%>\
    % if value is not None:
            <dt>${_("Featured")}</dt>
            <dd>${_("Yes") if value else _("No")}</dd>
    % endif
<%
    value = visualization.organization
%>\
    % if value is not None:
            <dt>${_("Organization")}</dt>
            <dd>${value}</dd>
    % endif
<%
    value = visualization.updated
%>\
    % if value is not None:
            <dt>${_("Updated")}</dt>
            <dd>${value}</dd>
    % endif
<%
    value = visualization.published
%>\
    % if value is not None:
            <dt>${_("Published")}</dt>
            <dd>${value}</dd>
    % endif
        </dl>
</%def>
