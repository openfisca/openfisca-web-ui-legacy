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


<%def name="form(root_question, user)" filter="trim">
    <form class="korma form" method="POST" name="situation" role="form">
        <ul class="nav nav-tabs">
            <li class="active"><a data-toggle="tab" href="#familles">Familles</a></li>
            <li><a data-toggle="tab" href="#foyers-fiscaux">Déclarations d'impôts</a></li>
            <li><a data-toggle="tab" href="#menages">Logements principaux</a></li>
        </ul>
        <div class="tab-content">
            <div class="tab-pane active" id="familles">
                ${root_question['familles'].html | n}
            </div>
            <div class="tab-pane" id="foyers-fiscaux">
                ${root_question['foyers_fiscaux'].html | n}
            </div>
            <div class="tab-pane" id="menages">
                ${root_question['menages'].html | n}
            </div>
        </div>
        <p class="buttons">
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
