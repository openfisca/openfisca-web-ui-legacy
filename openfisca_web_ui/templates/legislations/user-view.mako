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
import babel.dates
import datetime

from openfisca_web_ui import model, urls
%>


<%inherit file="/site.mako"/>


<%namespace name="legislation_tree" file="/legislations/legislation-tree.mako"/>


<%def name="appconfig_script()" filter="trim">
    <%legislation_tree:appconfig_script/>
</%def>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
<%
    user = model.get_user(ctx)
    is_dated_legislation = legislation.json is not None and legislation.json.get('datesim') is not None
    is_owner = user._id == legislation.author_id
    editable = is_owner and is_dated_legislation
%>\
        <div class="page-header">
            <h1>${_(u'Legislation')} <small>${legislation.get_title(ctx)}</small></h1>
        </div>
        <div class="panel panel-default">
            <div class="panel-body">
                <%self:view_fields/>
                ${self.view_content(user = user)}
            </div>
            <div class="panel-footer">
                <div class="btn-toolbar">
                    <a class="btn btn-default" href="${legislation.get_api1_url(ctx, 'json')}">
                        ${_(u'View as JSON')}
                    </a>
    % if not editable:
                    <a class="btn btn-default" href="${legislation.get_user_url(ctx, 'extract')}" \
title="${_(u'Duplicate legislation for today values')}">
                        ${_(u'Extract')}
                    </a>
    % endif
    % if is_owner:
                    <a class="btn btn-default" href="${legislation.get_user_url(ctx, 'edit')}">
                        ${_(u'Edit')}
                    </a>
                    <a class="btn btn-danger"  href="${legislation.get_user_url(ctx, 'delete')}">
                        ${_(u'Delete')}
                    </a>
    % endif
                </div>
            </div>
        </div>
</%def>


<%def name="css()" filter="trim">
    <%parent:css/>
    <link href="${urls.get_url(ctx, u'bower/x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css')}" \
media="screen" rel="stylesheet">
</%def>


<%def name="modals()" filter="trim">
<%
    user = model.get_user(ctx)
    is_dated_legislation = legislation.json is not None and legislation.json.get('datesim') is not None
    is_owner = user._id == legislation.author_id
    editable = is_owner and is_dated_legislation
%>\
    <%parent:modals/>
    ${legislation_tree.change_legislation_date_modal(date = date)}
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
            <dt>${_(u'Description')}</dt>
            <dd>${legislation.description}</dd>
    % endif
<%
    value = legislation.url
%>\
    % if value is not None:
            <dt>${_(u'Source URL')}</dt>
            <dd><a href="${value}">${value}</a></dd>
    % endif
    % if is_dated_legislation:
<%
        value = legislation.json['datesim']
%>\
        % if value is not None:
            <dt>${_(u'Dated legislation')}</dt>
            <dd>${value}</dd>
        % endif
    % else:
<%
        json_from = legislation.json.get('from')
        value = datetime.datetime.strptime(json_from, '%Y-%m-%d') if json_from is not None else None
%>\
        % if value is not None:
            <dt>${_(u'Begin date')}</dt>
            <dd>${babel.dates.format_date(value, format = 'short')}</dd>
        % endif
<%
        json_to = legislation.json.get('to')
        value = datetime.datetime.strptime(json_to, '%Y-%m-%d') if json_to is not None else None
%>\
        % if value is not None:
            <dt>${_(u'End date')}</dt>
            <dd>${babel.dates.format_date(value, format = 'short')}</dd>
        % endif
<%
        value = date
%>\
            <dt>${_(u'Values viewed for')}</dt>
            <dd>
                <a data-toggle="modal" data-target="#modal-change-legislation-date" href="#">
                    ${babel.dates.format_date(value, format = 'short') if value is not None else _(u'define')}
                </a>
            </dd>
    % endif
<%
    value = legislation.updated
%>\
    % if value is not None:
            <dt>${_(u'Updated')}</dt>
            <dd>${babel.dates.format_datetime(value)}</dd>
    % endif
<%
    value = legislation.published
%>\
    % if value is not None:
            <dt>${_(u'Published')}</dt>
            <dd>${babel.dates.format_datetime(value)}</dd>
        </dl>
    % endif
</%def>


<%def name="view_content(user = None)" filter="trim">
<%
    is_dated_legislation = legislation.json is not None and legislation.json.get('datesim') is not None
    if user is None:
        editable = False
    else:
        is_owner = user._id == legislation.author_id
        editable = is_owner and is_dated_legislation

    value = legislation.json
%>\
    % if value is not None:
        <div class="row">
            <div class="col-lg-8">
                <div class="buttons">
                    <button type="button" class="btn btn-default btn-xs btn-expand-all">
                        ${_(u'Open all')}
                    </button>
                    <button type="button" class="btn btn-default btn-xs btn-collapse-all">
                        ${_(u'Close all')}
                    </button>
                </div>
            </div>
        </div>
        % if editable:
        <div class="alert alert-info">
        % endif
        <div class="row">
            <div class="col-lg-8">
        % if dated_legislation_json is not None:
                ${legislation_tree.render_dated_legislation_node(node = dated_legislation_json, editable = editable)}
        % elif value.get('datesim') is not None:
                ${legislation_tree.render_dated_legislation_node(node = value, editable = editable)}
        % else:
                ${legislation_tree.render_legislation_node(node = value)}
        % endif
            </div>
        </div>
        % if editable:
        </div>
        % endif
    % endif
</%def>
