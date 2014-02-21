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


<%namespace name="render_legislation" file="/legislations/render-legislation.mako"/>


<%def name="breadcrumb_content()" filter="trim">
            <%parent:breadcrumb_content/>
            <li><a href="${urls.get_url(ctx, 'admin')}">${_(u"Admin")}</a></li>
            <li><a href="${model.Legislation.get_admin_class_url(ctx)}">${_(u"Legislations")}</a></li>
            <li class="active">${legislation.get_title(ctx)}</li>
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
                    <%self:view_fields/>
                </li>
                <li class="list-group-item">
                    <%self:view_content/>
                </li>
            </ul>
<%
    user = model.get_user(ctx)
%>\
    % if model.is_admin(ctx) or user is not None and user._id == legislation.author_id:
            <div class="panel-footer">
                <div class="btn-toolbar">
                    <a class="btn btn-default" href="${legislation.get_api1_url(ctx, 'json')}">
                        ${_(u'View as JSON')}
                    </a>
                    <a class="btn btn-default" href="${legislation.get_admin_url(ctx, 'edit')}">${_(u'Edit')}</a>
                    <a class="btn btn-danger"  href="${legislation.get_admin_url(ctx, 'delete')}">
                        <span class="glyphicon glyphicon-trash"></span> ${_('Delete')}
                    </a>
                </div>
            </div>
    % endif
        </div>
</%def>


<%def name="scripts()" filter="trim">
    <%render_legislation:scripts/>
</%def>


<%def name="title_content()" filter="trim">
${legislation.get_title(ctx)} - ${parent.title_content()}
</%def>


<%def name="view_fields()" filter="trim">
        <dl class="dl-horizontal">
<%
    value = legislation.description
%>\
    % if value is not None:
            <dt>${_("Description")}</dt>
            <dd>${legislation.description}</dd>
    % endif
<%
    value = legislation.url
%>\
    % if value is not None:
            <dt>${_("Source URL")}</dt>
            <dd><a href="${value}">${value}</a></dd>
    % endif
<%
    value = legislation.updated
%>\
    % if value is not None:
            <dt>${_("Updated")}</dt>
            <dd>${value}</dd>
    % endif
<%
    value = legislation.published
%>\
    % if value is not None:
            <dt>${_("Published")}</dt>
            <dd>${value}</dd>
        </dl>
    % endif
</%def>


<%def name="view_content()" filter="trim">
<%
    value = legislation.json
%>\
    % if value is not None:
        <div class="row">
            <div class="col-lg-8">
            % if value.get('datesim'):
                <%render_legislation:render_dated_legislation_node node="${value}"/>
            % else:
                <%render_legislation:render_legislation_node node="${value}"/>
            % endif:
##                <button type="button" class="btn btn-default btn-xs btn-toggle-open">
##                    ${_('Open all')}
##                </button>
##                <button type="button" class="btn btn-default btn-xs btn-toggle-close">
##                    ${_('Close all')}
##                </button>
            </div>
        </div>
    % endif
</%def>
