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


<%def name="appconfig_script()" filter="trim">
define('appconfig', ${helpers.index_appconfig(ctx) | n, js});
</%def>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
        <div class="row">
            <div class="col-sm-4">
                ${situation_form(root_question)}
            </div>
            <div class="col-sm-8">
                <div id="chart-wrapper"></div>
            </div>
        </div>
</%def>


<%def name="css()" filter="trim">
    <%parent:css/>
    <link href="${urls.get_url(ctx, u'bower/x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css')}" \
media="screen" rel="stylesheet">
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
    <%self:reset_modal/>
</%def>


<%def name="reset_modal()" filter="trim">
<%
    user = model.get_user(ctx)
%>\
    <div class="modal fade bs-modal-lg" id="reset-dialog" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">${_(u'Reset this simulation?')}</h4>
                </div>
                <div class="modal-body">
                    <p>${_(u'Data associated to this simulation will be deleted.')}</p>
                </div>
                <div class="modal-footer">
                    <a class="btn btn-danger btn-reset" \
href="${user.get_user_url(ctx, 'reset') if user is not None else '/'}">
                        ${_(u'Reset')}
                    </a>
                    <button type="button" class="btn btn-default" data-dismiss="modal">${_(u'Cancel')}</button>
                </div>
            </div>
        </div>
    </div>
</%def>


<%def name="situation_form(root_question)" filter="trim">
<%
    user = model.get_user(ctx)
%>\
    <form method="POST" name="situation" role="form">
        ${root_question.html | n}
        <div class="buttons">
    % if user is None or user.email is None:
            <a class="btn btn-default sign-in" href="#" title="${_(u'Save this simulation')}">
                ${_(u'Save')}
            </a>
    % endif
            <button class="btn btn-primary simulate">${_(u'Simulate')}</button>
            <button class="btn btn-default" data-toggle="modal" data-target="#export-modal">${_(u'Export')}</button>
            <button class="btn btn-default" data-toggle="modal" data-target="#reset-dialog">${_(u'Reset')}</button>
        </div>
    % if user is not None and user.email is not None:
        <p>
            <a href="${user.get_user_url(ctx)}">
                ${_(u'Viewing simulation "{}"').format(user.current_test_case.title)}
            </a>
        </p>
    % endif
    </form>
</%def>
