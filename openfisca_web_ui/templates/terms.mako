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
<article class="cgu">
    <h1 class="text-center">Politique de confidentialité</h1>

    <p>
        La présente politique de confidentialité décrit les termes et conditions dans lesquels la mission Etalab
        collecte les informations personnelles des utilisateurs de la plateforme Openfisca. Ce site a pour but
        d'offrir un service de simulation de la situation socio-fiscale des ménages.
    </p>

    <h2>Collecte et utilisation des informations personnelles</h2>

    <p>
        L'utilisation de la plateforme Openfisca est facultative.<br>
        Voici comment vous pouvez être amené à fournir ces données et les types de données que vous pourriez soumettre.
        <dl>
            <dt>Simulation</dt>
            <dd>
                Lors de l'utilisation de la plateforme Openfisca, nous vous inviterons à communiquer différents
                types d'informations. Vous seul pouvez choisir et décider de fournir des données personnelles à
                travers notre site. La plateforme Openfisca est itérative, c'est-à-dire que  plus les données
                fournies sont précises et complètes, meilleure est la simulation. Le défaut de réponse aux questions
                aura pour seule conséquence de rendre la simulation moins précise.
            </dd>
            <dt>Nous contacter</dt>
            <dd>
                Si vous souhaitez communiquez avec nous, pour nous signaler un dysfonctionnement, pour bénéficier
                d'une aide, ou simplement pour nous faire part de vos observations, une adresse électronique est
                mise à votre disposition dans la rubrique « Nous contacter ». Nous pourrons alors être amenés à
                vous demander des informations telles que votre adresse électronique, et différentes informations
                nous permettant de résoudre votre problème.<br>
            </dd>
        </dl>
    </p>

    <h2>Droit des personnes</h2>

    <p>
        Vous bénéficiez, à tout moment, d'un droit d'accès, de rectification, de modification, et de suppression de
        l'ensemble des données collectées depuis l'interface de votre compte.<br>
        Par ailleurs, vous pouvez obtenir depuis la plateforme une copie au format électronique des données collectées.
    </p>

    <h2>Destinataire des données</h2>

    <p>
        Ce simulateur vous permet d'obtenir une estimation de votre situation mais ne vous permet en aucun cas de faire
        valoir un droit.
    </p>

    <h2>Responsable du traitement</h2>

    <p>
        La collecte des données est mise en place par Etalab, mission placée sous l'autorité du Premier ministre et
        rattachée au secrétaire général du Gouvernement.
    </p>

    <h2>Conservation des données</h2>

    <p>
        Afin de vous permettre une réutilisation des données saisies d'une année sur l'autre, vos données seront
        conservées pendant deux ans.
    </p>
</article>
</%def>
