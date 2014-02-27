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


<%inherit file="/admin.mako"/>


<%def name="breadcrumb_content()" filter="trim">
            <%parent:breadcrumb_content/>
            <li><a href="${urls.get_url(ctx, 'admin')}">${_(u"Admin")}</a></li>
            <li><a href="${model.Account.get_admin_class_url(ctx)}">${_(u"Accounts")}</a></li>
            <li class="active">${account.get_title(ctx)}</li>
</%def>


<%def name="container_content()" filter="trim">
        <h2>${account.get_title(ctx)}</h2>
        <%self:view_fields/>
        <div class="btn-toolbar">
##            <a class="btn btn-default" href="${account.get_admin_url(ctx, 'stats')}">${_(u'Statistics')}</a>
##            <a class="btn btn-default" href="${urls.get_url(ctx, 'api', 1, 'accounts', account.slug)}">${_(u'JSON')}</a>
            <a class="btn btn-default" href="${account.get_admin_url(ctx, 'edit')}">${_(u'Edit')}</a>
            <a class="btn btn-danger"  href="${account.get_admin_url(ctx, 'delete')}"><span class="glyphicon glyphicon-trash"></span> ${_('Delete')}</a>
        </div>
</%def>


<%def name="title_content()" filter="trim">
${account.get_title(ctx)} - ${parent.title_content()}
</%def>


<%def name="view_fields()" filter="trim">
<%
    value = account.full_name
%>\
        % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Full Name"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
        % endif
<%
    value = account.slug
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Slug"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
    % endif
<%
    value = account.email
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Email"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
    % endif
<%
    value = account.description
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Description"))}</b></div>
        % if value is not None:
            <div class="col-sm-10">
                <ul class="nav nav-tabs">
                    <li class="active"><a data-toggle="tab" href="#about-view">${_(u"View")}</a></li>
                    <li><a data-toggle="tab" href="#about-source">${_(u"Source")}</a></li>
                </ul>
                <div class="tab-content">
                    <div class="active tab-pane" id="about-view">
                        ${value | n}
                    </div>
                    <div class="tab-pane" id="about-source">
                        <pre class="break-word">${value}</pre>
                    </div>
                </div>
            </div>
        % endif
        </div>
    % endif
<%
    value = account.admin
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Admin"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
    % endif
<%
    value = account.api_key
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("API Key"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
    % endif
<%
    value = account.updated
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Updated"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
    % endif
<%
    value = account.published
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Published"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
    % endif
</%def>

