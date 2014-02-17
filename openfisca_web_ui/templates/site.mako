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


<%doc>
    Site template inherited by each page
</%doc>


<%!
import datetime
import urlparse

from biryani1 import strings

from openfisca_web_ui import conf, model, urls
%>


<%def name="accept_cnil_conditions_modal(user)" filter="trim">
    <div class="modal fade bs-modal-lg" id="accept-cnil-conditions-modal" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <form method="post" action="${user.get_user_url(ctx, 'accept-cnil-conditions')}">
                    <div class="modal-header">
                        <h4 class="modal-title">Enregistrement de votre simulation</h4>
                    </div>
                    <div class="modal-body">
                        <p>
                            Vous pouvez consulter <a target="_blank" href="/terms">les conditions
                            générales d'utilisation ici</a>.
                        </p>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="accept-checkbox">
                                J'ai pris connaissance des conditions générales d'utilisation
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="accept-stats-checkbox">
                                J'accepte que mes données soient utilisées à des fins statistiques, après anonymisation.
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-success" disabled="disabled" name="accept" type="submit">
                            <span class="glyphicon glyphicon-ok"></span> Accepter
                        </button>
                        <button class="btn btn-danger" name="reject" type="button">
                            <span class="glyphicon glyphicon-remove"></span> Refuser
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</%def>


<%def name="accept_cookies_modal()" filter="trim">
    <div class="modal fade bs-modal-lg" id="accept-cookies-modal" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <form method="post" action="/accept-cookies">
                    <div class="modal-header">
                        <h4 class="modal-title">Conditions générales d'utilisation <small>(CGU)</small></h4>
                    </div>
                    <div class="modal-body">
                        <p>
                            Ce simulateur vous permet d'obtenir une estimation de votre situation mais ne vous permet en
                            aucun cas de faire valoir un droit.
                        </p>
                        <p>
                            Pour fonctionner, ce site a besoin d'utiliser des cookies.
                        </p>
                        <p>
                            Vous pouvez consulter <a target="_blank" href="/terms">les conditions
                            générales d'utilisation ici</a>.
                        </p>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="accept-checkbox">
                                J'ai pris connaissance des conditions générales d'utilisation
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-success" disabled="disabled" name="accept" type="submit">
                            <span class="glyphicon glyphicon-ok"></span> Accepter
                        </button>
                        <a class="btn btn-danger" href="${conf['www.url']}">
                            <span class="glyphicon glyphicon-remove"></span> Refuser
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</%def>


<%def name="body_content()" filter="trim">
    <div class="container">
        <%self:breadcrumb/>
        <%self:container_content/>
        <%self:footer/>
    </div>
</%def>


<%def name="brand()" filter="trim">
${conf['app_name']}
</%def>


<%def name="breadcrumb()" filter="trim">
        <ul class="breadcrumb">
            <%self:breadcrumb_content/>
        </ul>
</%def>


<%def name="breadcrumb_content()" filter="trim">
            <li><a href="${urls.get_url(ctx)}">${_('Home')}</a></li>
</%def>


<%def name="container_content()" filter="trim">
</%def>


<%def name="css()" filter="trim">
    <link href="${urls.get_url(ctx, u'bower/bootstrap/dist/css/bootstrap.css')}" media="screen" rel="stylesheet">
    <link href="${urls.get_url(ctx, u'css/site.css')}" media="screen" rel="stylesheet">
</%def>


<%def name="error_alert()" filter="trim">
    % if errors:
                <div class="alert alert-danger">
                    <h4 class="alert-heading">${_('Error!')}</h4>
        % if '' in errors:
<%
            error = unicode(errors[''])
%>\
            % if u'\n' in error:
                    <pre class="break-word">${error}</error>
            % else:
                    ${error}
            % endif
        % else:
                    ${_(u"Please, correct the informations below.")}
        % endif
                </div>
    % endif
</%def>


<%def name="feeds()" filter="trim">
</%def>


<%def name="footer()" filter="trim">
        <hr>
        <footer class="footer">
            <%self:footer_service/>
            <p>
                ${_('{0}:').format(_('Software'))}
                <a href="http://www.openfisca.fr" rel="external">OpenFisca</a>
                &mdash;
                <span>${_(u'Copyright © {} OpenFisca Team').format(u', '.join(
                    unicode(year)
                    for year in range(2011, datetime.date.today().year + 1)
                    ))}</span>
                &mdash;
                <a href="http://www.gnu.org/licenses/agpl.html" rel="external">${_(
                    u'GNU Affero General Public License')}</a>
            </p>
        </footer>
</%def>


<%def name="footer_service()" filter="trim">
</%def>


<%def name="hidden_fields()" filter="trim">
</%def>


<%def name="ie_scripts()" filter="trim">
    <!--[if lt IE 9]>
    <script src="${urls.get_url(ctx, u'bower/html5shiv/src/html5shiv.js')}"></script>
    <script src="${urls.get_url(ctx, u'bower/respond/respond.src.js')}"></script>
    <![endif]-->
</%def>


<%def name="metas()" filter="trim">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ## Make sure Internet Explorer can't use Compatibility Mode, as this will break Persona.
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
</%def>


<%def name="page_scripts()"></%def>


<%def name="scripts()" filter="trim">
    <script src="${urls.get_url(ctx, u'bower/requirejs/require.js')}"></script>
    <script src="${urls.get_url(ctx, u'js/requireconfig.js')}"></script>
% if conf['auth.enable']:
    ## You must include this on every page which uses navigator.id functions. Because Persona is still in development,
    ## you should not self-host the include.js file.
    <script src="${urlparse.urljoin(conf['persona.url'], 'include.js')}"></script>
% endif
    <script>
<%
user = model.get_user(ctx)
appconfig = {
    'api': {
        'urls': {
            'form': urls.get_url(ctx, 'api/1/form'),
            'simulate': urls.get_url(ctx, 'api/1/simulate'),
            },
        },
    'auth': {
        'currentUser': user.email if user is not None else None,
        'enable': conf['auth.enable'],
        },
    }
if conf['cookie'] not in req.cookies:
    appconfig['displayAcceptCookiesModal'] = True
elif user is not None:
    appconfig['displayAcceptCnilConditionsModal'] = user.email is not None and not user.cnil_conditions_accepted
%>\
define('appconfig', ${appconfig | n, js});
require([${urls.get_url(ctx, u'js/main.js') | n, js}]);
<%self:page_scripts/>
    </script>
</%def>


<%def name="title_content()" filter="trim">
<%self:brand/>
</%def>


<%def name="topbar()" filter="trim">
    <nav class="navbar navbar-default navbar-fixed-default navbar-inverse" role="navigation">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-topbar-collapse">
                <span class="sr-only">${_(u'Toggle navigation')}</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="/"><%self:brand/> <span class="label label-warning">pre-alpha</span></a>
        </div>
        <div class="collapse navbar-collapse navbar-topbar-collapse">
            <ul class="nav navbar-nav">
                <%self:topbar_links/>
            </ul>
            <%self:topbar_user/>
        </div>
    </nav>
</%def>


<%def name="topbar_links()" filter="trim">
    % if model.is_admin(ctx):
        <li class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#">${_('Administration')} <b class="caret"></b></a>
            <ul class="dropdown-menu">
                <li><a href="${model.Account.get_admin_class_url(ctx)}">${_('Accounts')}</a></li>
                <li><a href="${model.Legislation.get_admin_class_url(ctx)}">${_('Legislations')}</a></li>
##                <li><a href="${model.Simulation.get_admin_class_url(ctx)}">${_('Simulations')}</a></li>
            </ul>
        </li>
    % endif
<%
    user = model.get_user(ctx)
%>
    % if user is not None and user.email is not None:
                <li><a href="${user.get_user_url(ctx)}">${_('My simulations')}</a></li>
    % endif
                <li><a href="${model.Legislation.get_class_url(ctx)}">${_('Legislations')}</a></li>
                <li><a href="http://www.openfisca.fr/a-propos">${_('About')}</a></li>
                <li><a href="/terms" title="${_('Terms of use')}">${_('CGU')}</a></li>
</%def>


<%def name="topbar_user()" filter="trim">
    % if conf['auth.enable']:
<%
        user = model.get_user(ctx)
%>\
            <ul class="nav navbar-nav navbar-right">
        % if user is None or user.email is None:
                <li><a class="sign-in" href="#" title="${_(u'Access to your account and your simulations')}">${
                        _(u'Sign in')}</a></li>
        % else:
                <li class="active">
                    <a href="${user.get_user_url(ctx)}"><span class="glyphicon glyphicon-user"></span>${user.email}</a>
                </li>
                <li><a class="sign-out" href="#" title="${_(u'Sign out')}">${_(u'Sign out')}</a></li>
        % endif
            </ul>
    % endif
</%def>


<%def name="trackers()" filter="trim">
</%def>


<!DOCTYPE html>
<html lang="${ctx.lang[0][:2]}">
<head>
    <%self:metas/>
    <title>${self.title_content()}</title>
    <%self:css/>
    <%self:feeds/>
    <%self:ie_scripts/>
</head>
<body>
    <%self:topbar/>
    <%self:body_content/>
% if conf['cookie'] not in req.cookies:
    <%self:accept_cookies_modal/>
% elif ctx.session is not None and ctx.session.user is not None:
    <%self:accept_cnil_conditions_modal user="${ctx.session.user}"/>
% endif
    <%self:scripts/>
    <%self:trackers/>
</body>
</html>
