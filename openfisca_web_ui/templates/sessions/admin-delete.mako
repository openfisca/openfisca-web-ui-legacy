## -*- coding: utf-8 -*-


## OpenFisca -- A versatile microsimulation software
## By: OpenFisca Team <contact@openfisca.fr>
##
## Copyright (C) 2011, 2012, 2013, 2014, 2015 OpenFisca Team
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


<%inherit file="/admin.mako"/>
<%namespace name="view" file="admin-view.mako"/>


<%def name="breadcrumb_content()" filter="trim">
            <%parent:breadcrumb_content/>
            <li><a href="${urls.get_url(ctx, 'admin')}">${_(u"Admin")}</a></li>
            <li><a href="${model.Session.get_admin_class_url(ctx)}">${_(u"Sessions")}</a></li>
            <li><a href="${session.get_admin_url(ctx)}">${session.get_title(ctx)}</a></li>
            <li class="active">${_(u'Delete')}</li>
</%def>


<%def name="container_content()" filter="trim">
        <div class="page-header">
            <h1>${_(u'Delete a Session')} <small>${session.get_title(ctx)}</small></h1>
        </div>
        <p class="confirm">${_(u'Delete this session?')}</p>
        <form method="post" action="${session.get_admin_url(ctx, 'delete')}">
            <%view:view_fields/>
            <button class="btn btn-danger" name="submit" type="submit">${_(u'Delete')}</button>
        </form>
</%def>


<%def name="title_content()" filter="trim">
${_(u'Delete')} - ${session.get_title(ctx)} - ${parent.title_content()}
</%def>

