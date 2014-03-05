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


<%namespace name="object" file="/object-admin-index.mako"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
        <%self:search_form/>
    % if pager.item_count == 0:
        <h2>${_(u"No visualization found")}</h2>
    % else:
        % if pager.page_count > 1:
            % if pager.page_size == 1:
        <h2>${_(u"Visualization {0} of {1}").format(pager.first_item_number, pager.item_count)}</h2>
            % else:
        <h2>${_(u"Visualization {0} - {1} of {2}").format(pager.first_item_number, pager.last_item_number, pager.item_count)}</h2>
            % endif
        % elif pager.item_count == 1:
        <h2>${_(u"Single visualization")}</h2>
        % else:
        <h2>${_(u"{} visualizations").format(pager.item_count)}</h2>
        % endif
        <%object:pagination object_class="${model.Visualization}" pager="${pager}"/>
        <div class="row">
        % for visualization in visualizations:
            <div class="col-md-4 col-sm-6">
                <a href="${visualization.get_user_url(ctx)}">
                    <div class="thumbnail">
                        <img alt="visualization.get_title(ctx)">
                        <div class="caption">
                            <h3>visualization.get_title(ctx)</h3>
<%
            description_text = visualization.description
%>\
            % if description_text:
                            <p>${description_text}</p>
            % endif
                        </div>
                    </div>
                </a>
            </div>
        % endfor
        </div>
        <%object:pagination object_class="${model.Visualization}" pager="${pager}"/>
    % endif
<%
    user = model.get_user(ctx)
%>\
    % if user is not None and user.email is not None:
        <div class="btn-toolbar">
            <a class="btn btn-default" href="${model.Visualization.get_user_class_url(ctx, 'new')}">${_(u'New')}</a>
        </div>
    % endif
</%def>


<%def name="search_form()" filter="trim">
        <form action="${model.Visualization.get_user_class_url(ctx)}" method="get" role="form">
    % if data['advanced_search']:
            <input name="advanced_search" type="hidden" value="1">
    % endif
            <input name="sort" type="hidden" value="${inputs['sort'] or ''}">
<%
    error = errors.get('term') if errors is not None else None
%>\
            <div class="form-group${' has-error' if error else ''}">
                <label for="term">${_("Term")}</label>
                <input class="form-control" id="term" name="term" type="text" value="${inputs['term'] or ''}">
    % if error:
                <span class="help-block">${error}</span>
    % endif
            </div>
            <button class="btn btn-primary" type="submit"><span class="glyphicon glyphicon-search"></span> ${
                _('Search')}</button>
    % if data['advanced_search']:
            <a class="pull-right" href="${model.Visualization.get_user_class_url(ctx, **urls.relative_query(inputs,
                    advanced_search = None))}">${_('Simplified Search')}</a>
    % else:
            <a class="pull-right" href="${model.Visualization.get_user_class_url(ctx, **urls.relative_query(inputs,
                    advanced_search = 1))}">${_('Advanced Search')}</a>
    % endif
        </form>
</%def>


<%def name="title_content()" filter="trim">
${_('Visualizations')} - ${parent.title_content()}
</%def>
