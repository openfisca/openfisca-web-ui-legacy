## -*- coding: utf-8 -*-


## OpenFisca -- A versatile microsimulation software
## By: OpenFisca Team <contact@openfisca.fr>
##
## Copyright (C) 2011, 2012, 2013, 2014, 2015 OpenFisca Team
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

from biryani import strings

from openfisca_web_ui import conf, model, urls
from openfisca_web_ui.templates import helpers
%>


<%def name="brand()" filter="trim">
${_('OpenFisca Demonstrator')}
</%def>


<%def name="breadcrumb()" filter="trim">
        <ul class="breadcrumb">
            <%self:breadcrumb_content/>
        </ul>
</%def>


<%def name="breadcrumb_content()" filter="trim">
            <li><a href="${conf['urls.www']}">${_(u'Home')}</a></li>
            <li>
                <a href="${urls.get_url(ctx)}">${_(u'Demonstrator')}</a>
                <span class="label label-warning">${_(u'debug') if conf['debug'] else _(u'beta')}</span>
            </li>
</%def>


<%def name="container_content()" filter="trim">
</%def>


<%def name="css()" filter="trim">
    <link href="${urls.get_url(ctx, u'dist/vendor/bootstrap/css/bootstrap.min.css', static = True)}" media="screen" rel="stylesheet">
    <link href="${urls.get_url(ctx, u'css/site.css', static = True)}" media="screen" rel="stylesheet">
    <%self:page_css/>
</%def>


<%def name="error_alert()" filter="trim">
    % if errors:
                <div class="alert alert-danger">
                    <h1 class="alert-heading">${_(u'Error!')}</h1>
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
                    ${_(u'Please, correct the informations below.')}
        % endif
                </div>
    % endif
</%def>


<%def name="disclaimer()" filter="trim">
## TODO translate
        <div class="alert alert-warning disclaimer">
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
            <p>
                <strong>Attention !</strong>
                OpenFisca est un simulateur socio-fiscal à vocation pédagogique, en cours de développement :
            </p>
            <ul>
                <li>Les données que vous saisissez ne sont pas protégées.</li>
                <li>Les résultats des simulations peuvent comporter des erreurs.</li>
            </ul>
            <p>
                <strong>Ne saisissez pas de données personnelles.</strong>
            </p>
        </div>
</%def>


<%def name="feeds()" filter="trim">
</%def>


<%def name="footer()" filter="trim">
<footer class="footer hidden-xs navbar-inverse">
    <div class="container">
        <ul class="nav navbar-nav">
            <li><a href="http://stats.data.gouv.fr/index.php?idSite=4">${_(u'Website statistics')}</a></li>
            <li><a href="${urlparse.urljoin(conf['urls.www'], 'mentions-legales')}">${_(u'Legal terms')}</a></li>
            <li><a href="${urls.get_url(ctx, 'privacy-policy')}">${_(u'Privacy policy')}</a></li>
        </ul>
    </div>
</footer>
</%def>


<%def name="hidden_fields()" filter="trim">
</%def>


<%def name="ie_scripts()" filter="trim">
    <!--[if lt IE 9]>
    <script src="${urls.get_url(ctx, u'dist/vendor/html5shiv.min.js', static = True)}"></script>
    <script src="${urls.get_url(ctx, u'dist/vendor/respond.min.js', static = True)}"></script>
    <![endif]-->
</%def>


<%def name="metas()" filter="trim">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ## Make sure Internet Explorer can't use Compatibility Mode, as this will break Persona.
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
</%def>


<%def name="modals()" filter="trim">
</%def>


<%def name="page_css()" filter="trim">
</%def>


<%def name="page_scripts()" filter="trim">
</%def>


<%def name="scripts()" filter="trim">
    <script src="${urls.get_url(ctx, u'dist/vendor/jquery.js', static = True)}"></script>
    <script src="${urls.get_url(ctx, u'dist/vendor/bootstrap/js/bootstrap.js', static = True)}"></script>
    <%self:page_scripts/>
% if conf['enabled.livereload']:
    <script src="${'http://{0}:35731/livereload.js?snipver=1'.format(req.domain)}"></script>
% endif
</%def>


<%def name="title_content()" filter="trim">
${_(u'OpenFisca demonstrator')}
</%def>


<%def name="topbar()" filter="trim">
    <nav class="navbar navbar-inverse navbar-static-top" role="navigation">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#topbar-collapse">
                    <span class="sr-only">${_(u'Toggle navigation')}</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="${conf['urls.www']}">
                    <%self:brand/>
                </a>
            </div>
            <div class="collapse navbar-collapse" id="topbar-collapse">
                <ul class="nav navbar-nav">
    % if conf['enabled.auth']:
                    <%self:topbar_ui_menu/>
    % endif
                </ul>
                <ul class="nav navbar-nav navbar-right">
                    <li><a href="${conf['urls.www']}">${_(u'Back to Home')}</a></li>
                    <li class="visible-xs-block">
                        <a href="http://stats.data.gouv.fr/index.php?idSite=4">Statistiques du site</a>
                    </li>
                    <li class="visible-xs-block">
                        <a href="${urlparse.urljoin(conf['urls.www'], 'mentions-legales')}">${_(u'Legal terms')}</a>
                    </li>
                    <li class="visible-xs-block">
                        <a href="${urls.get_url(ctx, 'privacy-policy')}">${_(u'Privacy policy')}</a>
                    </li>
                    <%self:topbar_lang/>
                </ul>
            </div>
        </div>
    </nav>
</%def>


<%def name="topbar_lang()" filter="trim">
<%
country_name_by_code = {
    'france': _(u'France'),
    'tunisia': _(u'Tunisia'),
    }
language_name_by_code = {
    'en': u'English',
    'fr': u'Français',
    'ar': u'العربية',
    }
%>\
    <li class="dropdown">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
            ${language_name_by_code[ctx.lang[0]]} <span class="caret"></span>
        </a>
        <ul class="dropdown-menu" role="menu">
            <li role="presentation" class="dropdown-header">
                ${country_name_by_code[conf['country']]}
            </li>
    % for language_code in conf['languages']:
            <li>
                <a href="${urls.get_url(ctx, ctx.application_path_info, lang = language_code, **req.GET)}">
                    ${language_name_by_code[language_code]}
                </a>
            </li>
    % endfor
    % if conf['urls.other_ui_by_country']:
            <li role="presentation" class="divider"></li>
            <li role="presentation" class="dropdown-header">${_(u'Other countries')}</li>
        % for country_code, country_url in conf['urls.other_ui_by_country'].iteritems():
            <li>
                <a href="${country_url}">
                    ${country_name_by_code[country_code]}
                </a>
            </li>
        % endfor
        </ul>
    % endif
    </li>
</%def>


<%def name="topbar_ui_menu()" filter="trim">
<%
    user = model.get_user(ctx)
%>\
                <li class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                        ${_(u'Demonstrator')} <b class="caret"></b>
                    </a>
                    <ul class="dropdown-menu">
    % if model.is_admin(ctx):
                        <li role="presentation" class="dropdown-header">${_(u'Administration')}</li>
                        <li role="presentation">
                            <a role="menuitem" tabindex="-1" href="${model.Account.get_admin_class_url(ctx)}">
                                ${_(u'Accounts')}
                            </a>
                        </li>
                        <li role="presentation">
                            <a role="menuitem" tabindex="-1" href="${model.Session.get_admin_class_url(ctx)}">
                                ${_(u'Sessions')}
                            </a>
                        </li>
                        <li role="presentation" class="divider"></li>
    % endif
    % if user is None or user.email is None:
                        <li role="presentation">
                            <a role="menuitem" tabindex="-1" class="sign-in" href="#" title="${_(u'Your account and simulations')}">
                                ${_(u'Sign in')}
                            </a>
                        </li>
    % elif user is not None and user.email is not None:
                        <li role="presentation">
                            <a role="menuitem" tabindex="-1" href="${user.get_user_url(ctx)}" title="${_(u'My account')}">
                                <span class="glyphicon glyphicon-user"></span> ${user.email}
                            </a>
                        </li>
                        <li role="presentation">
                            <a role="menuitem" tabindex="-1" class="sign-out" href="#">
                                ${_(u'Sign out')}
                            </a>
                        </li>
    % endif
    % if conf['debug']:
                        <li role="presentation" class="divider"></li>
                        <li role="presentation" class="dropdown-header">${_(u'Debug')}</li>
                        <li role="presentation">
                            <a role="menuitem" tabindex="-1" href="${urls.get_url(ctx, 'login', 'dummy-admin', redirect = req.path)}">
                                ${_(u'Dummy admin')}
                            </a>
                        </li>
                        <li role="presentation">
                            <a role="menuitem" tabindex="-1" href="${urls.get_url(ctx, 'login', 'dummy-user', redirect = req.path)}">
                                ${_(u'Dummy user')}
                            </a>
                        </li>
    % endif
                    </ul>
                </li>
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
    <%self:modals/>
    <div id="js-modal"></div>
    <%self:topbar/>
    <div class="container-fluid">
        ## <%self:breadcrumb/>
% if conf['enabled.disclaimer'] and (ctx.session is None or not ctx.session.disclaimer_closed):
        <%self:disclaimer/>
% endif
        <%self:container_content/>
    </div>
    <%self:footer/>
    <%self:scripts/>
    <%self:trackers/>
</body>
</html>
