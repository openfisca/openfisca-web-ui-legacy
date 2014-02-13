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
    if simulation is None or simulation._id not in session.user.simulations:
        return wsgihelpers.not_found(ctx, explanation = ctx._(u'Simulation {} not found').format(id_or_slug))

    session.user.simulations.remove(simulation._id)
    session.user.save(ctx, safe = True)
    simulation.delete(ctx, safe = True)
    return wsgihelpers.redirect(ctx, location = session.user.get_user_url(ctx))


@wsgihelpers.wsgify
def edit(req):
    raise NotImplemented
    ctx = contexts.Ctx(req)

    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("User simulations forbidden"),
            message = ctx._("You can not view this simulation."),
            title = ctx._('Operation denied'),
            )

    simulation_slug = conv.check(conv.input_to_slug(req.urlvars.get('slug'), state = ctx))
    for simulation_name, simulation_data in session.user.simulations.iteritems():
        if simulation_slug == strings.slugify(simulation_name):
            session.user.api_data = simulation_data
            session.user.save(ctx, safe = True)
            break
    return wsgihelpers.redirect(ctx, location = '/')


def route(environ, start_response):
    router = urls.make_router(
        ('POST', '^/save/?$', save),
        ('POST', '^/(?P<id_or_slug>[^/]+)/delete/?$', delete),
        ('GET', '^/(?P<id_or_slug>[^/]+)/edit/?$', edit),
        ('GET', '^/(?P<id_or_slug>[^/]+)/use/?$', use),
        )
    return router(environ, start_response)


@wsgihelpers.wsgify
def save(req):
    ctx = contexts.Ctx(req)

    session = ctx.session
    if session is None or session.user is None:
        return wsgihelpers.forbidden(ctx,
            explanation = ctx._("View forbidden"),
            message = ctx._("You can not view an account."),
            title = ctx._('Operation denied'),
            )

    params = req.params
    inputs = {
        'title': params.get('title'),
        'id': params.get('id'),
        }
    data, errors = conv.pipe(
        conv.struct({
            'title': conv.cleanup_line,
            'id': conv.first_match(
                conv.test(lambda id: id == 'new'),
                model.Simulation.make_id_or_slug_or_words_to_instance(user_id = session.user._id),
                ),
            }),
        conv.rename_item('id', 'simulation'),
        )(inputs, state = ctx)
    if errors is None:
        simulation = data['simulation']
        if simulation == 'new':
            simulation = model.Simulation(
                author_id = session.user._id,
                title = data['title'],
                slug = strings.slugify(data['title']),
                )
        simulation.api_data = session.user.api_data
        simulation.save(ctx, safe = True)
        if session.user.simulations is None:
            session.user.simulations = [simulation._id]
            session.user.save(ctx, safe = True)
        elif simulation._id not in session.user.simulations:
            session.user.simulations.append(simulation._id)
            session.user.save(ctx, safe = True)
        return wsgihelpers.redirect(ctx, location = session.user.get_user_url(ctx))
    return wsgihelpers.bad_request(ctx, explanation = errors)


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
    if simulation is None or simulation._id not in session.user.simulations:
        return wsgihelpers.not_found(ctx, explanation = ctx._(u'Simulation {} not found').format(id_or_slug))

    session.user.api_data = simulation.api_data
    session.user.save(ctx, safe = True)
    return wsgihelpers.redirect(ctx, location = '/')
