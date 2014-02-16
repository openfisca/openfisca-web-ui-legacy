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


<%def name="body_content()" filter="trim">
    <div class="container">
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


<%def name="cnil_modal()" filter="trim">
    <div class="modal fade bs-modal-lg" id="cnil-modal" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <form method="post" action="/">
                    <div class="modal-header">
                        <a class="close" href="/">&times;</a>
                        <h4 class="modal-title">Enregistrement de votre simulation</h4>
                    </div>
                    <div class="modal-body">
                        Text d'exemple à remplacer par le texte concernant la CNIL
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="accept-checkbox">
                                J'ai pris connaissance des informations ci-dessus
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="stats-checkbox">
                                J'accepte que mes données soient utilisées à des fins statistiques, après anonymisation.
                            </label>
                        </div>
                    </div>
<%
    user = model.get_user(ctx)
    if user is None:
        return ''
%>\
                    <div class="modal-footer">
                        <button class="btn btn-success btn-accept-cnil" disabled="disabled" name="accept" type="submit">
                            <span class="glyphicon glyphicon-ok"></span> Accepter
                        </button>
                        <button class="btn btn-danger" name="reject" type="submit">
                            <span class="glyphicon glyphicon-remove"></span> Refuser
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
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
%>\
define('appconfig', {
    api: {
        urls: {
            form: ${urls.get_url(ctx, 'api/1/form') | n, js},
            simulate: ${urls.get_url(ctx, 'api/1/simulate') | n, js}
        }
    },
    auth: {
        currentUser: ${user.email if user is not None else None | n, js},
        enable: ${conf['auth.enable'] | n, js}
    }
});
require(['${urls.get_url(ctx, u'js/main.js')}']);
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
<%
user = model.get_user(ctx)
%>
    % if user is not None and user.email is not None:
                <li><a href="${user.get_user_url(ctx)}">${_('My simulations')}</a></li>
    % endif
                <li><a href="${model.Legislation.get_admin_class_url(ctx)}">${_('Legislations')}</a></li>
                <li><a href="http://www.openfisca.fr/a-propos">${_('About')}</a></li>
</%def>


<%def name="topbar_user()" filter="trim">
<%
user = model.get_user(ctx)
%>\
% if conf['auth.enable'] and user is not None:
            <ul class="nav navbar-nav navbar-right">
    % if user.email is None:
                <li><a class="sign-in" href="#" title="${_(u'Retrieve saved simulations')}">${_(u'Sign in')}</a></li>
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
    <%self:cnil_modal/>
    <%self:scripts/>
    <%self:trackers/>
</body>
</html>
