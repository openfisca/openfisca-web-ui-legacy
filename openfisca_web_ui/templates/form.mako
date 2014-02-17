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
from openfisca_web_ui import model, pages
%>


<%def name="form()" filter="trim">
<%
    user = model.get_user(ctx)
%>\
    % if simulations is not None and len(simulations) > 1:
        % for simulation in simulations:
            % if simulation._id == user.simulation_id:
<h1>${simulation.title}</h1>
            % endif
        % endfor
    % endif

    <%self:tabs/>

    % if korma_errors:
    <pre class="alert alert-error">${korma_errors | n, js, h}</pre>
    % endif

    <form class="korma form" method="POST" role="form">
        ${page_form.html | n}
        <p class="buttons">
            <input class="btn btn-success" title="${_(u'Launch this simulation')}" type="submit" value="${_(
                    u'Simulate')}">
    % if user is None or user.email is None:
            <a class="btn btn-success sign-in" href="#" title="${_(u'Save this simulation')}">
                ${_(u'Save')}
            </a>
    % endif
            <button class="btn btn-danger pull-right" data-toggle="modal" data-target="#reset-dialog" title="${_(
                    u'Reset this simulation')}">
                ${_(u'Reset')}
            </button>
        </p>
    </form>

    % if simulation_errors:
    <pre class="alert alert-error">${simulation_errors | n, js, h}</pre>
    % endif

    <div class="modal fade bs-modal-lg" id="reset-dialog" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">Effacer la simulation ?</h4>
                </div>
                <div class="modal-body">
                    <a class="btn btn-danger btn-reset" \
href="${user.get_admin_url(ctx, 'reset') if user  is not None else '/'}">
                        ${_(u'Yes')}
                    </a>
                    <button type="button" class="btn btn-default" data-dismiss="modal">${_(u'No')}</button>
                </div>
            </div>
        </div>
    </div>

    <%self:save_api_data_modal/>
</%def>


<%def name="save_api_data_modal()" filter="trim">
<%
    user = model.get_user(ctx)
    if user is None:
        return ''
%>\
    <div class="modal fade bs-modal-lg" id="save-api-data-modal" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <form class="form-horizontal" method="post" action="${model.Simulation.get_class_url(ctx, 'save')}">
                    <div class="modal-header">
                        <a class="close" href="/">&times;</a>
                        <h4 class="modal-title">Enregistrement de cette simulation</h4>
                    </div>
                    <div class="modal-body">
                        <h5>Écraser des données existantes ?</h5>
    % if simulations is not None:
        % for simulation in simulations:
                        <div class="radio">
                            <label>
                                <input type="radio" name="id" value="${simulation._id}">${simulation.title}
                            </label>
                        </div>
        % endfor
    % endif
                        <div class="radio">
                            <label>
                                <input data-toggle="collapse" data-target="#new-simulation-name" name="id" \
type="radio" value="new">
                                Nouvelle simulation
                            </label>
                        </div>
                        <div class="form-group collapse" id="new-simulation-name">
                            <label class="col-sm-2 control-label">Nom :</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" name="title">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Sauvegarder</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</%def>


<%def name="tabs()" filter="trim">
            <ul class="nav nav-tabs">
    % for page_data in pages.pages_data:
                <li${u' class="active"' if req.urlvars['page_data']['slug'] == page_data['slug'] else u'' | n}>
                    <a data-tab-name="${page_data['slug']}" href="#">${page_data['title']}</a>
                </li>
    % endfor
            </ul>
</%def>
