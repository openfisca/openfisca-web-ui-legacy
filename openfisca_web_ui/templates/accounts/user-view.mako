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


<%def name="container_content()" filter="trim">
        <h2>${account.get_title(ctx)}</h2>
        <%self:view_fields/>
        <div class="btn-toolbar">
            <a class="btn btn-default" href="${account.get_user_url(ctx, 'edit')}">${_(u'Edit')}</a>
            <a class="btn btn-danger"  href="${account.get_user_url(ctx, 'delete')}"><span class="glyphicon glyphicon-trash"></span> ${_('Delete')}</a>
        </div>
</%def>


<%def name="title_content()" filter="trim">
${account.get_title(ctx)} - ${parent.title_content()}
</%def>


<%def name="view_fields()" filter="trim">
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
    value = account.simulations
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Description"))}</b></div>
            <div class="col-sm-10">
                <table class="table table-stripped">
                    <tr>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
        % for simulation in simulations:
                    <tr>
                        <td>${simulation.title}</td>
                        <td>
                            <a class="btn btn-success" href="${simulation.get_url(ctx, 'use')}">Utiliser</a>
                            <a class="btn btn-default" href="${simulation.get_url(ctx, 'edit')}">Éditer</a>
                            <a class="btn btn-danger" href="${simulation.get_url(ctx, 'delete')}">Supprimer</a>
                        </td>
                    </tr>
        % endfor
                </table>
            </div>
        </div>
    % endif
</%def>

