# -*- coding: utf-8 -*-


import unittest

from biryani1 import strings
from webob import Request

from . import common
from .. import contexts, model


class TestLegislations(common.TestCaseWithApp):
    ctx = None
    legislation = None

    def setUp(self):  # noqa
        super(TestLegislations, self).setUp()
        self.ctx = contexts.Ctx()
        legislation_title = u'Legislation 1'
        self.legislation = model.Legislation(
            description = legislation_title,
            slug = strings.slugify(legislation_title),
            title = legislation_title,
            )
        self.legislation.save(safe = True)

    def test_admin_urls_as_anonymous(self):
        urls_data = [
            self.legislation.get_admin_url(self.ctx),
            self.legislation.get_admin_url(self.ctx, 'delete'),
            self.legislation.get_admin_url(self.ctx, 'extract'),
            self.legislation.get_admin_url(self.ctx, 'edit'),
            self.legislation.get_admin_url(self.ctx, 'delete'),
            ]
        for path in urls_data:
            req = Request.blank(path, method = 'GET')
            res = req.get_response(common.app)
            self.assertEqual(res.status_code, 401)

    def test_api1_urls_as_anonymous(self):
        # GET
        get_urls_data = [
            self.legislation.get_api1_class_url(self.ctx, 'typeahead'),
            self.legislation.get_api1_url(self.ctx, 'json'),
            ]
        for path in get_urls_data:
            req = Request.blank(path, method = 'GET')
            res = req.get_response(common.app)
            self.assertEqual(res.status_code, 200)
        # POST
        req = Request.blank(self.legislation.get_api1_url(self.ctx, 'edit'), method = 'POST')
        res = req.get_response(common.app)
        self.assertEqual(res.status_code, 401)

    def test_user_urls_as_anonymous(self):
        urls_data = [
            (self.legislation.get_user_url(self.ctx), 200),
            (self.legislation.get_user_url(self.ctx, 'extract'), 401),
            (self.legislation.get_user_url(self.ctx, 'edit'), 401),
            (self.legislation.get_user_url(self.ctx, 'delete'), 401),
            ]
        for path, expected_status_code in urls_data:
            req = Request.blank(path, method = 'GET')
            res = req.get_response(common.app)
            self.assertEqual(res.status_code, expected_status_code)


if __name__ == '__main__':
    unittest.main()
