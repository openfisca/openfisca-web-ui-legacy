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
import babel.dates
from copy import copy
import datetime
from itertools import chain

from biryani1 import strings

from openfisca_web_ui import urls, uuidhelpers
from openfisca_web_ui.templates import helpers
%>


<%def name="appconfig_script()" filter="trim">
define('appconfig', ${helpers.legislation_appconfig(ctx, legislation.get_api1_url(ctx, 'edit')) | n, js});
</%def>


<%def name="modal_change_legislation_date(date = None)" filter="trim">
<%
    current_datetime = date if date is not None else datetime.datetime.utcnow()
%>
    <div class="modal fade bs-modal-lg" id="modal-change-legislation-date" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <form>
                    <div class="modal-header">
                        <h4 class="modal-title">Visualiser cette législation pour une autre date</h4>
                    </div>
                    <div class="modal-body">
                        <p>
                            Les paramétres de législation peuvent contenir plusieurs valeurs. Chacune de ces valeurs est
                            appliquée pour un inteval de date donné.
                        </p>
                        <p>
                            Changer la date vous permez de visualiser les paramètres de le législation appliquable à la
                            date choisie.
                        </p>
                        <div class="form-group">
                            <label for="date">Date</label>
                            <input type="text" class="form-control" id="date" name="date" \
${u'placeholder' if date is None else u'value'}="${babel.dates.format_date(current_datetime, format = 'short')}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" type="submit">Valider</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</%def>


<%def name="modal_duplicate_and_edit()" filter="trim">
    <div class="modal fade bs-modal-lg" id="modal-duplicate-and-edit" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Dupliquer et éditer une législation</h4>
                </div>
                <div class="modal-body">
                    <p>
                        Vous pouvez modifier une législation si et seulement si les deux conditions suivantes sont
                        remplies :
                    </p>
                    <ul>
                        <li>Vous êtes l'auteur de la législation</li>
                        <li>Cette législation est au format « législation datée »</li>
                    </ul>
                    <p>
                        La législation que vous tentez d'éditer ne remplissant pas ces deux critères, une copie de
                        cette législation va être créer pour vous.
                    </p>
                </div>
                <div class="modal-footer">
                    <a class="btn btn-primary" href="${legislation.get_user_url(ctx, 'edit')}">${_(u'Edit')}</a>
                    <button type="button" class="btn btn-default" data-dismiss="modal">${_(u'Close')}</button>
                </div>
            </div>
        </div>
    </div>
</%def>


<%def name="render_dated_legislation_node(node, editable = False, path = None)" filter="trim">
    % if node.get('@type') == 'Node':
        % for node_name in node['children']:
<%
            node_title = node['children'][node_name].get('description')
            node_slug = strings.slugify(node_title)
            node_path = copy(path) if path is not None else []
            node_path.append(node_name)
            if path is None:
                html_node_path = strings.slugify(node_path[-1])
            else:
                html_node_path = strings.slugify("-".join(node_path))
%>\
                        <a href="#" class="collapse-node-toggle collapsed legislation-node" type="button" \
data-toggle="collapse" data-target="#${html_node_path}">
                            <span class="indicator"></span>
                            ${node_title}
                        </a>
                        <div id="${html_node_path}" class="collapse collapse-node">
                            ${self.render_dated_legislation_node(
                                node = node['children'][node_name],
                                editable = editable,
                                path = node_path,
                                )}
                        </div>
        % endfor
    % elif node.get('@type') == 'Scale':
        ${self.render_dated_legislation_scale(scale = node, editable = editable, path = path)}
    % elif node.get('@type') == 'Parameter':
        ${self.render_dated_legislation_parameter(parameter = node, editable = editable, path = path)}
    % endif
</%def>


<%def name="render_dated_legislation_scale(scale, editable = False, path = None)" filter="trim">
    <table class="table table-condensed">
        <thead>
            <tr>
                <th>Seuil</th>
                <th>Assiette</th>
                <th>Taux</th>
            </tr>
        </thead>
        <tbody>
    % for index, slice in enumerate(scale.get('slices')):
            <tr>
        % if editable is True:
                <td>
                    <a class="editable" data-name="${list(chain(path, ('slices', index, 'threshold'))) | n, js, h}">\
${slice['threshold'] if slice.get('threshold') else ''}</a>
                </td>
                <td>
                    <a class="editable" data-name="${list(chain(path, ('slices', index, 'base'))) | n, js, h}">\
${slice['base'] if slice.get('base') else ''}</a>
                </td>
                <td>
                    <a class="editable" data-name="${list(chain(path, ('slices', index, 'rate'))) | n, js, h}">\
${slice['rate'] if slice.get('rate') else ''}</a>
                </td>
        % else:
                <td>${slice['threshold'] if slice.get('threshold') else ''}</td>
                <td>${slice['base'] if slice.get('base') else ''}</td>
                <td>${slice['rate'] if slice.get('rate') else ''}</td>
        % endif
            </tr>
    % endfor
        </tbody>
    </table>
</%def>


<%def name="render_dated_legislation_parameter(parameter, editable = False, path = None)" filter="trim">
    % if editable is True:
    <a class="editable" data-name="${path | n, js, h}" href="#">${parameter.get('value')}</a>
    % else:
    <div data-name="${path | n, js, h}">${parameter.get('value')}</div>
    % endif
</%def>


<%def name="render_legislation_node(node, path = None)" filter="trim">
    % if node.get('@type') == 'Node':
        % for node_name in node['children']:
<%
            node_title = node['children'][node_name].get('description')
            node_slug = strings.slugify(node_title)
            node_path = copy(path) if path is not None else []
            node_path.append(node_name)
            if path is None:
                html_node_path = strings.slugify(node_path[-1])
            else:
                html_node_path = strings.slugify("-".join(node_path))
%>\
                        <a href="#" class="collapse-node-toggle collapsed legislation-node" type="button" \
data-toggle="collapse" data-target="#${html_node_path}">
                            <span class="indicator"></span>
                            ${node_title}
                        </a>
                        <div id="${html_node_path}" class="collapse collapse-node">
                            ${self.render_legislation_node(
                                node = node['children'][node_name],
                                path = node_path,
                                )}
                        </div>
        % endfor
    % elif node.get('@type') == 'Scale':
        <%self:render_legislation_scale scale="${node}" path="${path}"/>
    % elif node.get('@type') == 'Parameter':
        <%self:render_legislation_parameter parameter="${node['values']}"/>
    % endif
</%def>


<%def name="render_legislation_scale(scale, path)" filter="trim">
<%
html_node_path = strings.slugify("-".join(path))
dates_set = set()
for slice in scale.get('slices', []):
    for param in chain(slice.get('threshold', []), slice.get('rate', []), slice.get('base', [])):
        dates_set.add(param.get('from'))
        dates_set.add(param.get('to'))

dates = sorted(filter(None, [datetime.datetime.strptime(date, '%Y-%m-%d') for date in dates_set]))
periods = []
for index, date in enumerate(sorted(dates[:-1])):
    if dates[index + 1] - date <= datetime.timedelta(1):
        continue
    periods.append((date, dates[index + 1]))
%>
    <form>
        <select class="period-select">
    % for index, period in enumerate(periods):
            <option${u' checked="checked"' if index == len(periods) - 1 else '' | n} value="${index}">
                ${_(u'From {} to {}').format(
                    babel.dates.format_date(period[0], format = 'short'),
                    babel.dates.format_date(period[1], format = 'short'))}
            </option>
    % endfor
        </select>
    </form>
    <ul class="nav nav-tabs nav-hidden period-tabs">
    % for index, period in enumerate(periods):
        <li${u' class="active"' if index == len(periods) - 1 else '' | n}>
            <a href="#${html_node_path}-${period[0].strftime('%Y-%m-%d')}-${period[1].strftime('%Y-%m-%d')}">
                ${_(u'From {} to {}').format(
                    babel.dates.format_date(period[0], format = 'short'),
                    babel.dates.format_date(period[1], format = 'short'))}
            </a>
        </li>
    % endfor
    </ul>

    <div class="tab-content">
    % for index, period in enumerate(periods):
        <div class="tab-pane${u' active' if index == len(periods) - 1 else ''}" \
id="${html_node_path}-${period[0].strftime('%Y-%m-%d')}-${period[1].strftime('%Y-%m-%d')}">
            <table class="table table-condensed">
                <thead>
                    <tr>
                        <th>Seuil</th>
                        <th>Assiette</th>
                        <th>Taux</th>
                    </tr>
                </thead>
                <tbody>
        % for slice in scale.get('slices', []):
                    <tr>
            % for item_name in ['threshold', 'base', 'rate']:
                        <td>
                % for item in slice.get(item_name, []):
<%
                    from_date = datetime.datetime.strptime(item.get('from'), '%Y-%m-%d')
                    to_date = datetime.datetime.strptime(item.get('to'), '%Y-%m-%d')
                    from_bool = from_date >= period[0] and from_date <= period[1]
                    to_bool = to_date >= period[1]
%>\
                    % if from_bool and to_bool:
                            ${item.get('value')}
                    % endif
                % endfor
                        </td>
            % endfor
                    </tr>
        % endfor
                </tbody>
            </table>
        </div>
    % endfor
    </div>
</%def>


<%def name="render_legislation_parameter(parameter)" filter="trim">
<%
    if parameter is None or len(parameter) == 0:
        return ''
%>
    % if len(parameter) == 1:
        ${parameter[0].get('value')}
    % else:
    <table class="table table-condensed">
        <thead>
            <tr>
                <th>${_(u'Value')}</th>
                <th>${_(u'From')}</th>
                <th>${_(u'To')}</th>
            </tr>
        </thead>
        <tbody>
        % for param in parameter:
            <tr>
                <td>${param.get('value')}</td>
                <td>${param.get('from')}</td>
                <td>${param.get('to')}</td>
            </tr>
        % endfor
        </tbody>
    </table>
    % endif
</%def>
