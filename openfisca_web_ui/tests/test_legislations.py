# -*- coding: utf-8 -*-


import unittest

from biryani1 import strings
from webob import Request

from . import common
from .. import contexts, model


legislation_title = u'Test Legislation'


class TestLegislations(common.TestCaseWithApp):
    legislation = None

    def setUp(self):  # noqa
        super(TestLegislations, self).setUp()
        self.ctx = contexts.Ctx()
        self.legislation = model.Legislation(
            description = legislation_title,
            title = legislation_title,
            slug = strings.slugify(legislation_title),
            )

    def test_legislation_routes(self):
        routes = [
            ('GET', self.legislation.get_api1_url(self.ctx)),
            ('GET', self.legislation.get_api1_url(self.ctx, 'json')),
            ('GET', self.legislation.get_api1_url(self.ctx, 'edit')),
            ('GET', self.legislation.get_user_url(self.ctx)),
            ('GET', self.legislation.get_user_url(self.ctx, 'extract')),
            ('GET', self.legislation.get_user_url(self.ctx, 'edit')),
            ('GET', self.legislation.get_user_url(self.ctx, 'delete')),
            ('GET', self.legislation.get_admin_url(self.ctx)),
            ('GET', self.legislation.get_admin_url(self.ctx, 'delete')),
            ('GET', self.legislation.get_admin_url(self.ctx, 'extract')),
            ('GET', self.legislation.get_admin_url(self.ctx, 'edit')),
            ('GET', self.legislation.get_admin_url(self.ctx, 'delete')),
            ]
        for method, route in routes:
            req = Request.blank(route, method = method)
            res = req.get_response(common.app)
            print '{} - {}'.format(res.status_code, route)
            #self.assertEqual(res.status_code, 200)


if __name__ == '__main__':
    unittest.main()
