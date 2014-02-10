# -*- coding: utf-8 -*-


# OpenFisca -- A versatile microsimulation software
# By: OpenFisca Team <contact@openfisca.fr>
#
# Copyright (C) 2011, 2012, 2013, 2014 OpenFisca Team
# https://github.com/openfisca
#
# This file is part of OpenFisca.
#
# OpenFisca is free software; you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# OpenFisca is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


"""Pages meta-data"""


from . import conv, questions


pages_data = [
    {
        'api_data_to_page_korma_data': conv.familles.api_data_to_page_korma_data,
        'entity': 'familles',
        'form_factory': questions.familles.make_familles_repeat,
        'korma_data_to_page_api_data': conv.familles.korma_data_to_page_api_data,
        'name': 'familles',
        'slug': 'familles',
        'title': u'Familles',
        },
    {
        'api_data_to_page_korma_data': conv.foyers_fiscaux.api_data_to_page_korma_data,
        'entity': 'foyers_fiscaux',
        'form_factory': questions.foyers_fiscaux.make_foyers_fiscaux_repeat,
        'korma_data_to_page_api_data': conv.foyers_fiscaux.korma_data_to_page_api_data,
        'name': 'declarations_impots',
        'slug': 'declarations-impots',
        'title': u'Déclarations d\'impôts',
        },
    {
#        'api_data_to_page_korma_data': conv.menages.api_data_to_page_korma_data,
        'entity': 'menages',
        'form_factory': questions.menages.make_menages_repeat,
        'korma_data_to_page_api_data': conv.menages.korma_data_to_page_api_data,
        'name': 'logements_principaux',
        'slug': 'logements-principaux',
        'title': u'Logements principaux',
        },
    {
#        'api_data_to_page_korma_data': conv.legislation_urls.api_data_to_page_korma_data,
        'entity': 'legislation_url',
        'form_factory': questions.legislation_urls.make_legislation_urls_group,
        'korma_data_to_page_api_data': conv.legislation_urls.korma_data_to_page_api_data,
        'name': 'legislation_url',
        'slug': 'legislation-url',
        'title': u'Legislations',
        },
    ]
