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


<%inherit file="site.mako"/>


<%namespace file="form.mako" name="form"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
        <%self:disclaimer/>
<%
    user = model.get_user(ctx)
%>\
    % if user is not None and user.simulations is not None and len(user.simulations) > 1:
        % for simulation in user.simulations:
            % if simulation._id == user.current_simulation_id:
        <div class="page-header">
            <h1>${simulation.title}</h1>
        </div>
            % endif
        % endfor
    % endif
        <div class="row">
            <div class="col-sm-4">
                ${form.form(root_question=root_question, user=user)}
            </div>
            <div class="col-sm-8">
                <div id="chart-wrapper"></div>
            </div>
        </div>
</%def>


<%def name="disclaimer()" filter="trim">
        <div class="alert alert-warning">
            <p>
                <strong>Attention !</strong>
                OpenFisca est un simulateur socio-fiscal à vocation pédagogique, en cours de développement :
            </p>
            <ul>
                <li>Les données que vous saisissez ne sont pas protégées.</li>
                <li>Les résultats des simulations peuvent comporter des erreurs.</li>
            </ul>
            <p>
                <strong>Ne saisissez pas de données personnelles.</strong>
            </p>
        </div>
</%def>
