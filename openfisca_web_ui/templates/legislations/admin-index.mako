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


<%inherit file="/object-admin-index.mako"/>


<%def name="breadcrumb_content()" filter="trim">
            <%parent:breadcrumb_content/>
            <li><a href="${urls.get_url(ctx, 'admin')}">${_(u"Admin")}</a></li>
            <li class="active">${_(u'Legislations')}</li>
</%def>


<%def name="container_content()" filter="trim">
        <%self:search_form/>
    % if pager.item_count == 0:
        <h2>${_(u"No legislation found")}</h2>
    % else:
        % if pager.page_count > 1:
            % if pager.page_size == 1:
        <h2>${_(u"Legislation {0} of {1}").format(pager.first_item_number, pager.item_count)}</h2>
            % else:
        <h2>${_(u"Legislation {0} - {1} of {2}").format(pager.first_item_number, pager.last_item_number, pager.item_count)}</h2>
            % endif
        % elif pager.item_count == 1:
        <h2>${_(u"Single legislation")}</h2>
        % else:
        <h2>${_(u"{} legislations").format(pager.item_count)}</h2>
        % endif
        <%self:pagination object_class="${model.Legislation}" pager="${pager}"/>
        <table class="table table-bordered table-condensed table-striped">
            <thead>
                <tr>
            % if data['sort'] == 'slug':
                    <th>${_(u"Title")} <span class="glyphicon glyphicon-sort-by-attributes"></span></th>
            % else:
                    <th><a href="${model.Legislation.get_admin_class_url(ctx, **urls.relative_query(inputs, page = None,
                            sort = 'slug'))}">${_(u"Title")}</a></th>
            % endif
            % if data['sort'] == 'updated':
                    <th>${_(u"Updated")} <span class="glyphicon glyphicon-sort-by-attributes-alt"></span></th>
            % else:
                    <th><a href="${model.Legislation.get_admin_class_url(ctx, **urls.relative_query(inputs, page = None,
                            sort = 'updated'))}">${_(u"Updated")}</a></th>
            % endif
                </tr>
            </thead>
            <tbody>
        % for legislation in legislations:
                <tr>
                    <td>
                        <h4><a href="${legislation.get_admin_url(ctx)}">${legislation.title}</a></h4>
<%
            description_text = legislation.description
%>\
            % if description_text:
                        ${description_text}
            % endif
                    </td>
                    <td>${legislation.updated.split('T')[0]}</td>
                </tr>
        % endfor
            </tbody>
        </table>
        <%self:pagination object_class="${model.Legislation}" pager="${pager}"/>
    % endif
        <div class="btn-toolbar">
            <a class="btn btn-default" href="${model.Legislation.get_admin_class_url(ctx, 'new')}">${_(u'New')}</a>
        </div>
</%def>


<%def name="search_form()" filter="trim">
        <form action="${model.Legislation.get_admin_class_url(ctx)}" method="get" role="form">
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
            <a class="pull-right" href="${model.Legislation.get_admin_class_url(ctx, **urls.relative_query(inputs,
                    advanced_search = None))}">${_('Simplified Search')}</a>
    % else:
            <a class="pull-right" href="${model.Legislation.get_admin_class_url(ctx, **urls.relative_query(inputs,
                    advanced_search = 1))}">${_('Advanced Search')}</a>
    % endif
        </form>
</%def>


<%def name="title_content()" filter="trim">
${_('Legislations')} - ${parent.title_content()}
</%def>

