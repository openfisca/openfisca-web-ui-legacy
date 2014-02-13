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
            <a class="btn btn-danger"  href="${account.get_user_url(ctx, 'delete')}">
                <span class="glyphicon glyphicon-trash"></span> ${_('Delete account')}</a>
        </div>

        <%self:modals/>
</%def>


<%def name="modals()" filter="trim">
    % for simulation in simulations:
        <%self:modals_edit simulation="${simulation}"/>
    % endfor
    % for simulation in simulations:
        <%self:modals_delete simulation="${simulation}"/>
    % endfor
</%def>


<%def name="modals_edit(simulation)" filter="trim">
    <div class="modal fade bs-modal-lg" id="${u'edit-{}-modal'.format(simulation.slug)}" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">Editer la simulation ${simulation.title}</h4>
                </div>
                <form class="form-horizontal" method="POST" action="${simulation.get_url(ctx, 'edit')}">
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Nom :</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" name="title" value="${simulation.title}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label">Description :</label>
                            <div class="col-sm-10">
                                <textarea class="form-control" name="description">\
${simulation.description or ''}</textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-success" name="submit" type="submit">
                            <span class="glyphicon glyphicon-ok"></span> Enregistrer
                        </button>
                        <button type="button" class="btn btn-default" data-dismiss="modal" aria-hidden="true">Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</%def>


<%def name="modals_delete(simulation)" filter="trim">
    <div class="modal fade bs-modal-lg" id="${u'delete-{}-modal'.format(simulation.slug)}" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">Supprimer la simulation ${simulation.title} ?</h4>
                </div>
                <div class="modal-body">
                    <form method="POST" action="${simulation.get_url(ctx, 'delete')}">
                        <button type="submit" class="btn btn-danger">${_(u'Yes')}</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">${_(u'No')}</button>
                    </form>
                </div>
            </div>
        </div>
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
                <table class="table table-striped">
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Action</th>
                    </tr>
        % for simulation in simulations:
                    <tr>
                        <td>${simulation.title}</td>
                        <td>${simulation.description or ''}</td>
                        <td>
                            <a class="btn btn-success" href="${simulation.get_url(ctx, 'use')}">Utiliser</a>
                            <a class="btn btn-default" href="#" data-toggle="modal" \
data-target="#${u'edit-{}-modal'.format(simulation.slug)}">Éditer</a>
                            <a class="btn btn-danger" href="#" data-toggle="modal" \
data-target="#${u'delete-{}-modal'.format(simulation.slug)}">Supprimer</a>
                        </td>
                    </tr>
        % endfor
                </table>
            </div>
        </div>
    % endif
</%def>

