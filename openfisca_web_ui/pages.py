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


from korma.choice import Select
from korma.group import Group
from korma.repeat import Repeat
from korma.text import Number, Text


bootstrap_control_inner_html_template = u'''
<label class="col-sm-6 control-label" for="{self.full_name}">{self.label}</label>
<div class="col-sm-6">
  {self.control_html}
</div>'''


bootstrap_group_outer_html_template = u'<div class="form-group">{self.inner_html}</div>'


pages_data = [
    {
        'name': 'famille',
        'slug': 'famille',
        'title': u'Famille',
        },
    {
        'name': 'declaration_impots',
        'slug': 'declaration-impots',
        'title': u'Déclaration d\'impôts',
        },
    {
        'name': 'logement_principal',
        'slug': 'logement-principal',
        'title': u'Logement principal',
        },
    ]


def page_form(ctx, page_name):
    page_form_by_page_name = {
        'declaration_impots': Repeat(
            children_attributes = {
                '_outer_html_template': u'''<div class="repeated-group">{self.inner_html}
<a href="/all-questions?entity=foy&idx={self.parent_data[declaration_impot_repeat][index]}"
class="btn btn-primary"> Plus de détails</a></div>''',
                },
            template_question = Group(
                children_attributes = {
                    '_outer_html_template': bootstrap_group_outer_html_template,
                    },
                name = 'declaration_impot',
                questions = [
                    Select(
                        choices = persons_value_and_name(ctx),
                        control_attributes = {'class': 'form-control'},
                        inner_html_template = bootstrap_control_inner_html_template,
                        label = u'Vous',
                        ),
                    Select(
                        choices = persons_value_and_name(ctx),
                        control_attributes = {'class': 'form-control'},
                        inner_html_template = bootstrap_control_inner_html_template,
                        label = u'Conj',
                        ),
                    Repeat(
                        template_question = Select(
                            choices = persons_value_and_name(ctx),
                            control_attributes = {'class': 'form-control'},
                            label = u'Personne à charge',
                            inner_html_template = bootstrap_control_inner_html_template,
                            name = 'pac',
                            ),
                        ),
                    ]
                ),
            ),
        'famille': Repeat(
            children_attributes = {
                '_outer_html_template': u'''<div class="repeated-group">{self.inner_html}
<a href="/all-questions?entity=fam&idx={self.parent_data[famille_repeat][index]}" class="btn btn-primary">
Plus de détails</a></div>''',
                },
            outer_html_template = u'<div class="repeat">{self.inner_html}</div>',
            template_question = Group(
                children_attributes = {
                    '_outer_html_template': bootstrap_group_outer_html_template,
                    },
                name = 'famille',
                questions = [
                    Select(
                        choices = persons_value_and_name(ctx),
                        control_attributes = {'class': 'form-control'},
                        inner_html_template = bootstrap_control_inner_html_template,
                        label = u'Parent1',
                        ),
                    Select(
                        choices = persons_value_and_name(ctx),
                        control_attributes = {'class': 'form-control'},
                        inner_html_template = bootstrap_control_inner_html_template,
                        label = u'Parent2',
                        ),
                    Repeat(
                        template_question = Select(
                            choices = persons_value_and_name(ctx),
                            control_attributes = {'class': 'form-control'},
                            inner_html_template = bootstrap_control_inner_html_template,
                            label = u'Enfant',
                            name = 'enf',
                            ),
                        ),
                    ]
                ),
            ),
        'logement_principal': Repeat(
            children_attributes = {
                '_outer_html_template': u'''<div class="repeated-group">{self.inner_html}
<a href="/all-questions?entity=men&idx={self.parent_data[logement_principal_repeat][index]}"
class="btn btn-primary">Plus de détails</a></div>''',
                },
            template_question = Group(
                outer_html_template = u'<div class="repeated-group">{self.inner_html}</div>',
                children_attributes = {
                    '_control_attributes': {'class': u'form-control'},
                    '_inner_html_template': bootstrap_control_inner_html_template,
                    '_outer_html_template': bootstrap_group_outer_html_template,
                    },
                name = 'logement_principal',
                questions = [
                    Select(
                        choices = [
                            u'Non renseigné',
                            u'Accédant à la propriété',
                            u'Propriétaire (non accédant) du logement',
                            u'Locataire d\'un logement HLM',
                            u'Locataire ou sous-locataire d\'un logement loué vide non-HLM',
                            u'Locataire ou sous-locataire d\'un logement loué meublé ou d\'une chambre d\'hôtel',
                            u'Logé gratuitement par des parents, des amis ou l\'employeur',
                            ],
                        first_unselected = True,
                        label = u'Statut d\'occupation',
                        name = u'so',
                        ),
                    Number(label = u'Loyer'),
                    Text(label = u'Localité'),
                    ]
                ),
            ),
        }
    return page_form_by_page_name[page_name]


def persons_value_and_name(ctx):
    if ctx.session is None or \
            ctx.session.user is None or \
            ctx.session.user.korma_data is None or \
            ctx.session.user.korma_data.get('personne') is None or \
            ctx.session.user.korma_data['personne'].get('personnes') is None:
        return []
    return [
        (unicode(idx), person['person_data'].get('name') or idx)
        for idx, person in enumerate(ctx.session.user.korma_data['personne']['personnes'] or [])
        ]
