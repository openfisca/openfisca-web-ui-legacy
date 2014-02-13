/*
 * OpenFisca -- A versatile microsimulation software
 * By: OpenFisca Team <contact@openfisca.fr>
 *
 * Copyright (C) 2011, 2012, 2013, 2014 OpenFisca Team
 * https://github.com/openfisca
 *
 * This file is part of OpenFisca.
 *
 * OpenFisca is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * OpenFisca is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


$(function() {
    $('.typeahead#user').typeahead({
        name: 'user',
        remote: '/api/1/accounts/typeahead?q=%QUERY'
    });
    $('.typeahead#tag').typeahead({
        name: 'tag',
        remote: '/api/1/tags/typeahead?q=%QUERY'
    });

    $('.collapse-node-toggle').on('click', function() {
      var $span = $(this).find('span');
      if ($span.hasClass('glyphicon-chevron-right')) {
        $span.removeClass('glyphicon-chevron-right');
        $span.addClass('glyphicon-chevron-down');
      } else {
        $span.removeClass('glyphicon-chevron-down');
        $span.addClass('glyphicon-chevron-right');
      }
    });
});
