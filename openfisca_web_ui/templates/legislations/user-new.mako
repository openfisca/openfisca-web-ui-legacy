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
from openfisca_web_ui import conf, model, urls
%>


<%inherit file="/site.mako"/>
<%namespace name="edit" file="user-edit.mako"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
        <div class="page-header">
            <h1>${_(u'Create a Legislation')}</h1>
        </div>
        <form method="post" role="form">
            <%edit:hidden_fields/>
            <%self:error_alert/>
            <%edit:form_fields/>
            <button class="btn btn-primary" name="submit" type="submit">${_(u'Create')}</button>
        </form>
</%def>


<%def name="css()" filter="trim">
        <%edit:css/>
</%def>


<%def name="scripts()" filter="trim">
        <%edit:scripts/>
</%def>


<%def name="title_content()" filter="trim">
${_(u'New Legislation')} - ${parent.title_content()}
</%def>
