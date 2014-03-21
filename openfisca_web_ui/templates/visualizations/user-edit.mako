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
import datetime

from openfisca_web_ui import conf, model, urls
%>


<%inherit file="/site.mako"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
        <div class="page-header">
            <h1>${_(u'Edit a Visualization')} <small>${visualization.get_title(ctx)}</small></h1>
        </div>
        <form method="post" role="form">
            <%self:hidden_fields/>
            <%self:error_alert/>
            <%self:form_fields/>
            <div class="checkbox">
                <label>
                    <input${' checked' if inputs['featured'] else ''} disabled id="featured" name="featured" \
type="checkbox">
                    ${_(u'Featured')}
                </label>
            </div>
            <div class="checkbox">
                <label>
                    <input${' checked' if inputs['enabled'] else ''} disabled id="enabled" name="enabled" \
type="checkbox">
                    ${_(u'Enabled')}
                </label>
            </div>
            <button class="btn btn-primary" name="submit" type="submit">${_(u'Save')}</button>
        </form>
</%def>


<%def name="form_fields()" filter="trim">
<%
    error = errors.get('title') if errors is not None else None
%>\
                <div class="form-group${' has-error' if error else ''}">
                    <label for="title">${_(u'Title')} *</label>
                    <input class="form-control" id="title" name="title" required type="text" value="${inputs['title'] or ''}">
    % if error:
                    <span class="help-block">${error}</span>
    % endif
                </div>
<%
    error = errors.get('description') if errors is not None else None
%>\
                <div class="form-group${' has-error' if error else ''}">
                    <label for="description">${_(u'Description')}</label>
                    <textarea class="form-control" id="description" name="description">${
                        inputs['description'] or ''}</textarea>
    % if error:
                    <span class="help-block">${error}</span>
    % endif
                </div>
<%
    error = errors.get('thumbnail_url') if errors is not None else None
%>\
                <div class="form-group${' has-error' if error else ''}">
                    <label for="thumbnail-url">${_(u'Visualization\'s thumbnail URL')}</label>
                    <input class="form-control" id="thumbnail-url" name="thumbnail-url" type="text" \
value="${inputs['thumbnail_url'] or ''}">
    % if error:
                    <pre class="help-block alert-danger">${error | n, js, h}</pre>
    % endif
                </div>
<%
    error = errors.get('url') if errors is not None else None
%>\
                <div class="form-group${' has-error' if error else ''}">
                    <label for="url">${_(u'Visualization URL')} *</label>
                    <input class="form-control" id="url" name="url" type="text" value="${inputs['url'] or ''}">
    % if error:
                    <pre class="help-block alert-danger">${error | n, js, h}</pre>
    % endif
                </div>
<%
        error = errors.get('iframe') if errors is not None else None
%>\
                <div class="checkbox${' has-error' if error else ''}">
                    <label>
                        <input${' checked' if inputs['iframe'] else ''} id="iframe" name="iframe" type="checkbox" \
value="1">
                        ${_(u'This visualization accepts a "simulate_url" GET parameter.')}
                    </label>
    % if error:
                    <span class="help-block">${error}</span>
    % endif
                </div>
<%
    error = errors.get('organization') if errors is not None else None
%>\
                <div class="form-group${' has-error' if error else ''}">
                    <label for="thumbnail-url">${_(u'Organization')}</label>
                    <input class="form-control" id="organization" name="organization" type="text" \
value="${inputs['organization'] or ''}">
    % if error:
                    <pre class="help-block alert-danger">${error | n, js, h}</pre>
    % endif
                </div>
</%def>


<%def name="hidden_fields()" filter="trim">
</%def>


<%def name="title_content()" filter="trim">
${_(u'Edit')} - ${visualization.get_title(ctx)} - ${parent.title_content()}
</%def>

