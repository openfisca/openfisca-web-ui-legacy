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


<%inherit file="site.mako"/>


<%def name="breadcrumb()" filter="trim">
</%def>


<%def name="container_content()" filter="trim">
</%def>


<%def name="scripts()" filter="trim">
    <%parent:scripts/>
    <script>
requirejs.config({
  paths : {
    domReady: '/bower/requirejs-domready/domReady',
    jquery: '/bower/jquery/jquery',
    modernizr: '/bower/modernizr/modernizr',
    myClass: '/bower/my-class/my.class'
  }
});
define(
  'config',
${page_form.full_javascript_config | n, js}
);
require(['/js/main.js']);
    </script>
</%def>
