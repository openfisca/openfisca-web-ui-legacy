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


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
<%
user = model.get_user(ctx)
%>\
<div class="alert alert-warning">
    <p>
        <strong>Attention</strong> : ce simulateur est en cours de développement.
    </p>
    <p>
        Les données que vous saisissez ne sont pas protégées et pourront être effacées à tout moment.
    </p>
    <p>
        Les résultats des simulations peuvent comporter des erreurs.
    </p>
</div>
    % if user is not None and simulations is not None and len(simulations) > 1:
        % for simulation in simulations:
            % if simulation._id == user.simulation_id:
<h1>${simulation.title}</h1>
            % endif
        % endfor
    % endif
<div class="row">
  <div class="col-sm-4">
    <div id="form-wrapper"></div>
  </div>
  <div class="col-sm-8">
    <div id="chart-wrapper"></div>
  </div>
</div>
</%def>
