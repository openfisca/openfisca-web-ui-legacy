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


"""Controllers for simulations"""


import datetime

from biryani1 import strings

from .. import contexts, conv, model, urls, wsgihelpers


@wsgihelpers.wsgify
def delete(req):
    ctx = contexts.Ctx(req)
    assert req.method == 'POST'

    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("User simulations forbidden"),
            message = ctx._("You can not view this simulation."),
            title = ctx._('Operation denied'),
            )

    id_or_slug = req.urlvars.get('id_or_slug')
    simulation = conv.check(
        model.Simulation.make_id_or_slug_or_words_to_instance(user_id = session.user._id)(id_or_slug, state = ctx)
        )
    if simulation is None or simulation._id not in session.user.simulations_id:
        return wsgihelpers.not_found(ctx, explanation = ctx._(u'Simulation {} not found').format(id_or_slug))

    session.user.simulations_id.remove(simulation._id)
    if len(session.user.simulations_id) == 0:
        simulation.delete(safe = True)
        simulation_date = datetime.datetime.utcnow()
        simulation_title = u'Ma simulation du {} à {}'.format(
            datetime.datetime.strftime(simulation_date, u'%d/%m/%Y'),
            datetime.datetime.strftime(simulation_date, u'%H:%M'),
            )
        simulation = model.Simulation(
            author_id = session.user._id,
            title = simulation_title,
            slug = strings.slugify(simulation_title),
            )
        simulation.save(safe = True)
        session.user.current_simulation = simulation
        session.user.simulations_id = [simulation._id]
    elif session.user.current_simulation_id == simulation._id:
        session.user.current_simulation = simulation
        session.user.current_simulation = session.user.simulations[0]
        simulation.delete(safe = True)
    session.user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = session.user.get_user_url(ctx))


@wsgihelpers.wsgify
def duplicate(req):
    ctx = contexts.Ctx(req)

    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("View forbidden"),
            message = ctx._("You can not view an account."),
            title = ctx._('Operation denied'),
            )

    id_or_slug = req.urlvars.get('id_or_slug')
    simulation = conv.check(
        model.Simulation.make_id_or_slug_or_words_to_instance(user_id = session.user._id)(id_or_slug, state = ctx)
        )
    if simulation is None or simulation._id not in session.user.simulations_id:
        return wsgihelpers.not_found(ctx, explanation = ctx._(u'Simulation {} not found').format(id_or_slug))

    del simulation._id
    simulation.description = u'Copie de la simulation {}'.format(simulation.title)
    simulation.title = u'{} « (Copie) »'.format(simulation.title)
    simulation.slug = strings.slugify(simulation.title)
    simulation.save(safe = True)
    if session.user.simulations_id is None:
        session.user.simulations_id = [simulation._id]
        session.user.current_simulation_id = simulation._id
        session.user.save(safe = True)
    elif simulation._id not in session.user.simulations_id:
        session.user.simulations_id.append(simulation._id)
        session.user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = session.user.get_user_url(ctx))


@wsgihelpers.wsgify
def edit(req):
    ctx = contexts.Ctx(req)
    assert req.method == 'POST'

    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("User simulations forbidden"),
            message = ctx._("You can not view this simulation."),
            title = ctx._('Operation denied'),
            )

    params = req.params
    inputs = {
        'title': params.get('title'),
        'description': params.get('description'),
        'id_or_slug': req.urlvars.get('id_or_slug'),
        }
    data, errors = conv.pipe(
        conv.struct({
            'title': conv.cleanup_line,
            'description': conv.cleanup_line,
            'id_or_slug': conv.first_match(
                conv.test(lambda id: id == 'new'),
                model.Simulation.make_id_or_slug_or_words_to_instance(user_id = session.user._id),
                ),
            }),
        conv.rename_item('id_or_slug', 'simulation'),
        )(inputs, state = ctx)
    if errors is not None:
        return wsgihelpers.bad_request(ctx, explanation = errors)

    if data['simulation'] == 'new':
        data['simulation'] = model.Simulation(
            author_id = session.user._id,
            description = data['description'],
            title = data['title'],
            slug = strings.slugify(data['title']),
            )
        data['simulation'].api_data = None
        data['simulation'].save(safe = True)
        if session.user.simulations_id is None:
            session.user.simulations_id = [data['simulation']._id]
            session.user.current_simulation_id = data['simulation']._id
            session.user.save(safe = True)
        elif data['simulation']._id not in session.user.simulations_id:
            session.user.simulations_id.append(data['simulation']._id)
            session.user.current_simulation_id = data['simulation']._id
            session.user.save(safe = True)
        return wsgihelpers.redirect(ctx, location = urls.get_url(ctx))

    if data['simulation'] is None or data['simulation']._id not in session.user.simulations_id:
        return wsgihelpers.not_found(ctx, explanation = ctx._(u'Simulation {} not found').format(data['id_or_slug']))

    data['simulation'].title = data['title']
    data['simulation'].slug = strings.slugify(data['title'])
    data['simulation'].description = data['description']
    data['simulation'].save(safe = True)
    return wsgihelpers.redirect(ctx, location = session.user.get_user_url(ctx))


def route(environ, start_response):
    router = urls.make_router(
#        ('POST', '^/save/?$', save),
        ('POST', '^/(?P<id_or_slug>[^/]+)/delete/?$', delete),
        ('GET', '^/(?P<id_or_slug>[^/]+)/duplicate/?$', duplicate),
        ('POST', '^/(?P<id_or_slug>[^/]+)/edit/?$', edit),
        ('GET', '^/(?P<id_or_slug>[^/]+)/use/?$', use),
        )
    return router(environ, start_response)


@wsgihelpers.wsgify
def use(req):
    ctx = contexts.Ctx(req)

    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("User simulations forbidden"),
            message = ctx._("You can not view this simulation."),
            title = ctx._('Operation denied'),
            )

    id_or_slug = req.urlvars.get('id_or_slug')
    simulation = conv.check(
        model.Simulation.make_id_or_slug_or_words_to_instance(user_id = session.user._id)(id_or_slug, state = ctx)
        )
    if simulation is None or simulation._id not in session.user.simulations_id:
        return wsgihelpers.not_found(ctx, explanation = ctx._(u'Simulation {} not found').format(id_or_slug))

    session.user.current_simulation = simulation
    session.user.save(safe = True)
    return wsgihelpers.redirect(ctx, location = urls.get_url(ctx))
