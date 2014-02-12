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


import datetime

from . import conf, model, uuidhelpers


def ensure_session(ctx):
    session = ctx.session
    if session is None:
        session = ctx.session = model.Session()
        session.token = uuidhelpers.generate_uuid()
    if session.user is None:
        user = model.Account()
        user._id = uuidhelpers.generate_uuid()
        user.api_key = uuidhelpers.generate_uuid()
        user.compute_words()
        session.user_id = user._id
        user.save(ctx, safe = True)
        session.user = user
    session.expiration = datetime.datetime.utcnow() + datetime.timedelta(hours = 4)
    session.save(ctx, safe = True)
    if ctx.req.cookies.get(conf['cookie']) != session.token:
        ctx.req.response.set_cookie(conf['cookie'], session.token, httponly = True, secure = ctx.req.scheme == 'https')
