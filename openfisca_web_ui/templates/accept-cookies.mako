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
from openfisca_web_ui import urls
%>


<%inherit file="site.mako"/>


<%def name="container_content()" filter="trim">
    <form method="post">
        <p>
            Pour fonctionner, ce site a besoin d'utiliser des cookies.
            <br>
        </p>
        <div class="checkbox">
            <label>
                <input type="checkbox" name="accept-checkbox">
                J'ai pris connaissance des informations ci-dessus
            </label>
        </div>
        <button class="btn btn-success btn-accept-cookie" disabled="disabled" name="accept" type="submit">
            <span class="glyphicon glyphicon-ok"></span> Accepter
        </button>
        <button class="btn btn-danger" name="reject" type="submit">
            <span class="glyphicon glyphicon-remove"></span> Refuser
        </button>
    </form>
</%def>


<%def name="page_scripts()">
require(['${urls.get_url(ctx, u'js/AcceptCookies.js')}']);
</%def>
