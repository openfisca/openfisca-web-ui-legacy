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
from openfisca_web_ui.templates import helpers
%>


<%inherit file="site.mako"/>


<%namespace file="forms.mako" name="forms"/>


<%def name="appconfig_script()" filter="trim">
define('appconfig', ${helpers.index_appconfig(ctx) | n, js});
</%def>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
<%
    user = model.get_user(ctx)
%>\
    % if user is not None and user.test_cases is not None and len(user.test_cases) > 1:
        % for test_case in user.test_cases:
            % if test_case._id == user.current_test_case_id:
        <div class="page-header">
            <h1>${test_case.title}</h1>
        </div>
            % endif
        % endfor
    % endif
        <div class="row">
            <div class="col-sm-4">
                ${forms.situation_form(root_question=root_question, user=user)}
            </div>
            <div class="col-sm-8">
                <div id="chart-wrapper"></div>
                <button class="btn btn-default" data-toggle="modal" data-target="#export-modal">${_(u'Export')}</button>
            </div>
        </div>
</%def>


<%def name="css()" filter="trim">
    <%parent:css/>
    <link href="${urls.get_url(ctx, u'bower/x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css')}" \
media="screen" rel="stylesheet">
    <link href="${urls.get_url(ctx, u'bower/nvd3/nv.d3.css')}" media="screen" rel="stylesheet">
    <link href="${urls.get_url(ctx, u'css/chart.css')}" media="screen" rel="stylesheet">
</%def>


<%def name="export_modal()" filter="trim">
    <div class="modal fade" id="export-modal" tabindex="-1" role="dialog" aria-labelledby="export-modal-label" \
aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title" id="export-modal-label">${_(u'Export')}</h4>
          </div>
          <div class="modal-body">
            <a class="btn btn-primary" href="/api/1/session" rel="external" target="_blank">
              ${_(u'Export simulation input')}
            </a>
            <a class="btn btn-primary" href="/api/1/simulate" rel="external" target="_blank">
              ${_(u'Export simulation output')}
            </a>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">${_(u'Close')}</button>
          </div>
        </div>
      </div>
    </div>
</%def>


<%def name="modals()" filter="trim">
    <%parent:modals/>
    <%self:export_modal/>
</%def>
