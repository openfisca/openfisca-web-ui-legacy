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


<%inherit file="form.mako"/>


<%def name="container_content()" filter="trim">
    <h1>Déclaration d'impôt sur le revenu</h1>

    <img src="/waterfall.png" alt="Graphique" style="width: 500px;">

    <ul class="nav nav-tabs">
      <li><a href="/personne">Personnes</a></li>
      <li class="active"><a href="/declaration-impot">Déclaration d'impôt</a></li>
      <li><a href="/famille">Famille</a></li>
      <li><a href="/logement-principal">Logement principal</a></li>
    </ul>

    <form action="/declaration-impot" class="korma" method="POST">
        ${page_form.html | n}
        <input class="btn btn-success" type="submit">
    </form>

    <a class="btn btn-primary" href="/all-questions?entity=foy">Plus de détails</a>
</%def>
