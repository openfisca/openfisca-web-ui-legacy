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
<%namespace name="view" file="user-view.mako"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
        <div class="page-header">
            <h1>${_(u'Delete a Visualization')} <small>${visualization.get_title(ctx)}</small></h1>
        </div>
        <p class="confirm">${_(u'Delete this visualization?')}</p>
        <form method="post" action="${visualization.get_user_url(ctx, 'delete')}">
            <%view:view_fields/>
            <button class="btn btn-danger" name="submit" type="submit">${_(u'Delete')}</button>
        </form>
</%def>


<%def name="title_content()" filter="trim">
${_(u'Delete')} - ${visualization.get_title(ctx)} - ${parent.title_content()}
</%def>
