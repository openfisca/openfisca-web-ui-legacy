# -*- coding: utf-8 -*-


import unittest

from webob import Request

from . import common


class TestForms(common.TestCaseWithApp):
    def setUp(self):  # noqa
        super(TestForms, self).setUp()

    def test_accept_cookie_url(self):
        req = Request.blank(
            '/accept-cookies',
            method = 'POST',
            POST = {
                'accept-checkbox': 'on',
                'accept': '',
                },
            )
        res = req.get_response(self.app)
        self.assertEqual(res.status_code, 302)
        assert 'Set-Cookie' in res.headers
        self.cookie = res.headers['Set-Cookie']

    def test_root_url_without_cookie(self):
        req = Request.blank('/', method = 'GET')
        res = req.get_response(self.app)
        self.assertEqual(res.status_code, 200)

if __name__ == '__main__':
    unittest.main()
