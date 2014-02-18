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
import collections

from biryani1 import strings

from openfisca_web_ui import model, urls
%>


<%inherit file="/site.mako"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
        <h2>${legislation.get_title(ctx)}</h2>
        <%self:view_fields/>
        <div class="btn-toolbar">
            <a class="btn btn-success" href="${legislation.get_api1_url(ctx, 'json')}">${_(u'JSON')}</a>
        </div>
</%def>


<%def name="render_legislation_node(node)" filter="trim">
    % if node.get('@type') == 'Node':
        % for node_name in node['children']:
<%
            node_title = node['children'][node_name].get('description')
            node_slug = strings.slugify(node_title)
%>\
                        <p>
                            <a href="#" class="collapse-node-toggle collapsed" type="button" data-toggle="collapse" data-target="#node-${node_slug}">
                                <span></span>
                                ${node_title}
                            </a>
                        </p>
                        <div id="node-${node_slug}" class="collapse collapse-node">
                            <%self:render_legislation_node node="${node['children'][node_name]}"/>
                        </div>
        % endfor
    % elif node.get('@type') == 'Scale':
        <%self:render_legislation_scale scale="${node}"/>
    % elif node.get('@type') == 'Parameter':
        <%self:render_legislation_parameter parameter="${node['values']}"/>
    % endif
</%def>


<%def name="render_legislation_scale(scale)" filter="trim">
    <table class="table table-stripped">
        <tr>
            <th>Seuil</th>
            <th>Assiette</th>
            <th>Taux</th>
        </tr>
    % for slice in scale.get('slices'):
        <tr>
            <td>${slice['threshold'][-1].get('value') if slice.get('threshold') else ''}</td>
            <td>${slice['base'][-1].get('value') if slice.get('base') else ''}</td>
            <td>${slice['rate'][-1].get('value') if slice.get('rate') else ''}</td>
        </tr>
    % endfor
    </table>
</%def>


<%def name="render_legislation_parameter(parameter)" filter="trim">
    ${parameter[-1].get('value')}
</%def>


<%def name="title_content()" filter="trim">
${legislation.get_title(ctx)} - ${parent.title_content()}
</%def>


<%def name="view_fields()" filter="trim">
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Title"))}</b></div>
            <div class="col-sm-10">${legislation.title}</div>
        </div>
<%
    value = legislation.description
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Description"))}</b></div>
            <div class="col-sm-10">
                ${legislation.description}
            </div>
        </div>
    % endif
<%
    value = legislation.json
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Content"))}</b></div>
            <div class="col-sm-10">
<%
        user = model.get_user(ctx)
%>\
        % if user is not None and user.email is not None:
                <ul class="nav nav-tabs">
                    <li class="active"><a data-toggle="tab" href="#description-view">${_(u"View")}</a></li>
                    <li><a data-toggle="tab" href="#description-source">${_(u"Source")}</a></li>
                </ul>
                <div class="tab-content">
                    <div class="active tab-pane" id="description-view">
        % endif
                        <%self:render_legislation_node node="${value}"/>
        % if user is not None and user.email is not None:
                    </div>
                    <div class="tab-pane" id="description-source">
                        <pre class="break-word">${value | n, js, h}</pre>
                    </div>
                </div>
        % endif
                <hr>
            </div>
        </div>
    % endif
<%
    value = legislation.updated
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Updated"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
    % endif
<%
    value = legislation.published
%>\
    % if value is not None:
        <div class="row">
            <div class="col-sm-2 text-right"><b>${_(u'{0}:').format(_("Published"))}</b></div>
            <div class="col-sm-10">${value}</div>
        </div>
    % endif
</%def>

