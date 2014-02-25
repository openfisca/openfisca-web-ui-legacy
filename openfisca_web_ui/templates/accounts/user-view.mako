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


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
        <div class="page-header">
            <h1>${_(u'My account')} <small>${account.get_title(ctx)}</small></h1>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading">
                <h2 class="panel-title">${_(u'My simulations')}</h2>
            </div>
            <%self:view_fields/>
            <div class="panel-footer">
                <a class="btn btn-primary" href="#" data-toggle="modal" data-target="#edit-new-modal">
                    ${_('New simulation')}
                </a>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">
                <h2 class="panel-title">${_(u'My scenarios')}</h2>
            </div>
            <form action="${urls.get_url(ctx, 'scenarios')}" class="korma form-inline" method="POST" role="form">
                ${scenarios_question.html | n}
                <div class="panel-footer">
                    <button class="btn btn-success" type="submit">${_('Enregistrer')}</button>
                </div>
            </form>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">
                <h2 class="panel-title">${_(u'My rights')}</h2>
            </div>
            <div class="panel-footer">
                <a class="btn btn-danger" href="#" data-toggle="modal" data-target="#delete-user-modal">
                    <span class="glyphicon glyphicon-trash"></span> ${_('Delete account')}
                </a>
            </div>
        </div>
</%def>


<%def name="modals()" filter="trim">
<%
user = model.get_user(ctx)
%>
    % if user is not None and user.simulations is not None:
        % for simulation in user.simulations:
        <%self:modals_edit simulation="${simulation}"/>
        % endfor
    % endif
<%
    simulation = model.Simulation(slug = 'new', title = '')
%>\
        <%self:modals_edit simulation="${simulation}"/>
    % if user is not None:
        % for simulation in user.simulations:
        <%self:modals_delete simulation="${simulation}"/>
        % endfor
    % endif
        <%self:modals_delete_user/>
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
                        <button type="submit" class="btn btn-danger">${_(u'Delete')}</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">${_(u'Cancel')}</button>
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
                    <h4 class="modal-title">${_(u'Delete this account?')}</h4>
                </div>
                <div class="modal-body">
                    <form method="POST" action="${account.get_user_url(ctx, 'delete')}">
                        <button type="submit" class="btn btn-danger">${_(u'Delete')}</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">${_(u'Cancel')}</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</%def>


<%def name="modals_edit(simulation)" filter="trim">
    <div class="modal fade bs-modal-lg" id="${u'edit-{}-modal'.format(simulation.slug)}" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    % if simulation.title == 'new':
                    <h4 class="modal-title">${_('New Simulation')}</h4>
    % else:
                    <h4 class="modal-title">${_('Edit Simulation')} ${simulation.title}</h4>
    % endif
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


<%def name="title_content()" filter="trim">
${account.get_title(ctx)} - ${parent.title_content()}
</%def>


<%def name="view_fields()" filter="trim">
        <table class="table">
            <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
<%
user = model.get_user(ctx)
%>
    % if user is not None:
            <tbody>
        % for simulation in user.simulations:
                <tr>
                    <td>${'<span class="glyphicon glyphicon-ok"></span>' \
                        if simulation._id == account.current_simulation_id else u' ' | n}</td>
                    <td><a href="${simulation.get_url(ctx, 'use')}">${simulation.title}</a></td>
                    <td>${simulation.description or ''}</td>
                    <td>
                        <a class="btn btn-sm btn-primary" href="${simulation.get_url(ctx, 'use')}">${_(u'Use')}</a>
                        <a class="btn btn-sm btn-default" href="#" data-toggle="modal" \
data-target="#${u'edit-{}-modal'.format(simulation.slug)}">${_(u'Edit')}</a>
                        <a class="btn btn-sm btn-default" href="${simulation.get_url(ctx, 'duplicate')}">
                            ${_(u'Duplicate')}
                        </a>
                        <a class="btn btn-sm btn-danger" href="#" data-toggle="modal" \
data-target="#${u'delete-{}-modal'.format(simulation.slug)}">${_(u'Delete')}</a>
                    </td>
                </tr>
        % endfor
            <tbody>
    % endif
        </table>
</%def>


