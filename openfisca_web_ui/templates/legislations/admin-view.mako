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
import collections

from openfisca_web_ui import model, urls
%>


<%inherit file="/site.mako"/>


<%def name="breadcrumb_content()" filter="trim">
            <%parent:breadcrumb_content/>
            <li><a href="${urls.get_url(ctx, 'admin')}">${_(u"Admin")}</a></li>
            <li><a href="${model.Legislation.get_admin_class_url(ctx)}">${_(u"Legislations")}</a></li>
            <li class="active">${legislation.get_title(ctx)}</li>
</%def>


<%def name="container_content()" filter="trim">
        <h2>${legislation.get_title(ctx)}</h2>
        <%self:view_fields/>
        <div class="btn-toolbar">
            <a class="btn btn-default" href="${legislation.get_admin_url(ctx, 'edit')}">${_(u'Edit')}</a>
            <a class="btn btn-danger"  href="${legislation.get_admin_url(ctx, 'delete')}"><span class="glyphicon glyphicon-trash"></span> ${_('Delete')}</a>
        </div>
</%def>


<%def name="title_content()" filter="trim">
${legislation.get_title(ctx)} - ${parent.title_content()}
</%def>


<%def name="view_fields()" filter="trim">
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Title"))}</b></div>
            <div class="col-sm-10">${legislation.title}</div>
        </div>
<%
    value = legislation.json
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Description"))}</b></div>
            <div class="col-sm-10">
                <ul class="nav nav-tabs">
                    <li class="active"><a data-toggle="tab" href="#description-view">${_(u"View")}</a></li>
                    <li><a data-toggle="tab" href="#description-source">${_(u"Source")}</a></li>
                </ul>
                <div class="tab-content">
                    <div class="active tab-pane" id="description-view">
                        ${legislation.description}
                    </div>
                    <div class="tab-pane" id="description-source">
                        <pre class="break-word">${value | n, js, h}</pre>
                    </div>
                </div>
            </div>
        </div>
    % endif
<%
    value = legislation.updated
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Updated"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
    % endif
<%
    value = legislation.published
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Published"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
    % endif
</%def>

