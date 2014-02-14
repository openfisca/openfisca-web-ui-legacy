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
            <a class="btn btn-primary" href="#" data-toggle="modal" data-target="#edit-new-modal">
                ${_('New simulation')}
            </a>

            <a class="btn btn-danger pull-right" href="#" data-toggle="modal" data-target="#delete-user-modal">
                <span class="glyphicon glyphicon-trash"></span> ${_('Delete account')}
            </a>
        </div>

        <%self:modals/>
</%def>


<%def name="modals()" filter="trim">
    % for simulation in simulations:
        <%self:modals_edit simulation="${simulation}"/>
    % endfor
<%
    simulation = model.Simulation(slug = 'new', title = '')
%>\
        <%self:modals_edit simulation="${simulation}"/>
    % for simulation in simulations:
        <%self:modals_delete simulation="${simulation}"/>
    % endfor
        <%self:modals_delete_user/>
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


<%def name="modals_delete_user()" filter="trim">
    <div class="modal fade bs-modal-lg" id="delete-user-modal" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">${_(u"Are you sure that you want to delete this account?")}</h4>
                </div>
                <div class="modal-body">
                    <form method="POST" action="${account.get_user_url(ctx, 'delete')}">
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
    <table class="table table-striped">
        <tr>
            <th></th>
            <th>Name</th>
            <th>Description</th>
            <th>Action</th>
        </tr>
    % for simulation in simulations:
        <tr>
            <td><span class="glyphicon glyphicon-ok"></span></td>
            <td><a href="${simulation.get_url(ctx, 'use')}">${simulation.title}</a></td>
            <td>${simulation.description or ''}</td>
            <td>
                <a class="btn btn-primary" href="#" data-toggle="modal" \
data-target="#${u'edit-{}-modal'.format(simulation.slug)}">Éditer</a>
                <a class="btn btn-danger" href="#" data-toggle="modal" \
data-target="#${u'delete-{}-modal'.format(simulation.slug)}">
                    <span class="glyphicon glyphicon-trash"></span> Supprimer
                </a>
            </td>
        </tr>
    % endfor
    </table>
</%def>

