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
from openfisca_web_ui import pages
%>

<%inherit file="site.mako"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="tabs()" filter="trim">
            <ul class="nav nav-tabs">
    % for page_data in pages.pages_data:
                <li${u' class="active"' if req.urlvars['page_data']['slug'] == page_data['slug'] else u'' | n}>
                    <a href="${u'/{}'.format(page_data['slug'])}">${page_data['title']}</a>
                </li>
    % endfor
            </ul>
</%def>


<%def name="container_content()" filter="trim">
% if korma_errors:
    <pre class="alert alert-error">${korma_errors | n, js, h}</pre>
% endif
    <div class="row">
        <div class="col-sm-6">
            <%self:tabs/>
            <form class="korma form" method="POST" role="form">
                ${page_form.html | n}
                <p>
                    <input class="btn btn-success" type="submit" value="Valider">
                    <button class="btn btn-danger pull-right" data-toggle="modal" data-target="#reset-dialog">
                        ${_(u'Reset')}
                    </button>
                </p>
            </form>
        </div>

        <div class="col-sm-6">
% if simulation_errors:
            <pre class="alert alert-warning">${simulation_errors | n, js, h}</pre>
% else:
            <img class="waterfall-img" src="/image/waterfall.png" alt="Graphique">
% endif
        </div>
    </div>

    <div class="modal fade bs-modal-lg" id="reset-dialog" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">Effacer la simulation ?</h4>
                </div>
                <div class="modal-body">
                    <a class="btn btn-danger btn-reset" href="${ctx.user.get_admin_url(ctx, 'reset')}">
                        ${_(u'Yes')}
                    </a>
                    <button type="button" class="btn btn-default" data-dismiss="modal">${_(u'No')}</button>
                </div>
            </div>
        </div>
    </div>
</%def>
