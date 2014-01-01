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

<%inherit file="/site.mako"/>


<%def name="pagination(object_class, pager)" filter="trim">
    % if pager.page_count > 1:
            <div class="text-center">
                <ul class="pagination">
                    <li class="prev${' disabled' if pager.page_number <= 1 else ''}">
                        <a href="${object_class.get_admin_class_url(ctx, **urls.relative_query(inputs,
                                page = max(pager.page_number - 1, 1)))}">&larr;</a>
                    </li>
        % for page_number in range(max(pager.page_number - 5, 1), pager.page_number):
                    <li>
                        <a href="${object_class.get_admin_class_url(ctx, **urls.relative_query(inputs,
                                page = page_number))}">${page_number}</a>
                    </li>
        % endfor
                    <li class="active">
                        <a href="${object_class.get_admin_class_url(ctx, **urls.relative_query(inputs,
                                page = pager.page_number))}">${pager.page_number}</a>
                    </li>
        % for page_number in range(pager.page_number + 1, min(pager.page_number + 5, pager.last_page_number) + 1):
                    <li>
                        <a href="${object_class.get_admin_class_url(ctx, **urls.relative_query(inputs,
                                page = page_number))}">${page_number}</a>
                    </li>
        % endfor
                    <li class="next${' disabled' if pager.page_number >= pager.last_page_number else ''}">
                        <a href="${object_class.get_admin_class_url(ctx, **urls.relative_query(inputs,
                                page = min(pager.page_number + 1, pager.last_page_number)))}">&rarr;</a>
                    </li>
                </ul>
            </div>
    % endif
</%def>

