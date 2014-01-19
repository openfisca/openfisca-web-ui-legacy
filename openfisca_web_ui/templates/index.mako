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

import pymongo

from openfisca_web_ui import model, texthelpers, urls
%>


<%inherit file="site.mako"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
##        <div class="page-header">
##            <h1><%self:brand/></h1>
##        </div>
        <%self:jumbotron/>
        <form action="/simulation" role="form">
            <div class="form-group">
                <label for="maxrev">Salaire imposable</label>
                <input class="form-control" id="maxrev" name="maxrev" value="20000" type="int">
            </div>

            <div class="form-group">
                <label for="nmen">Nombre de ménage</label>
                <input class="form-control" id="nmen" name="nmen" value="3" type="int">
            </div>

            <div class="form-group">
                <label for="birth">Date de naissance</label>
                <input class="form-control" id="birth" name="birth" value="1965-12-27" type="date">
            </div>

            <div class="form-group">
                <label for="year">Année</label>
                <input class="form-control" id="year" name="year" value="2006" type="int">
            </div>
            <button type="submit" class="btn btn-default">Submit</button>
        </form>
</%def>


<%def name="jumbotron()" filter="trim">
<%
    user = model.get_user(ctx)
%>\
        <div class="jumbotron">
            <div class="container">
                <h2>${_(u"Welcome to OpenFisca")}</h2>
                <p>${_(u"A versatile microsimulation software")}</p>
    % if user is None:
                <a class="btn btn-large btn-primary sign-in" href="#" title="${_(u'Sign in with Persona')}">${
                    _('Sign In')}</a>
    % endif
            </div>
        </div>
</%def>
