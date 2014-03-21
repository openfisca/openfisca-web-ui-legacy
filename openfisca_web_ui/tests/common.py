# -*- coding: utf-8 -*-


import os
import unittest

from paste.deploy import loadapp

from .. import environment


app = None


class TestCaseWithApp(unittest.TestCase):
    def setUp(self):  # noqa
        global app
        if app is None:
            conf_file_path = os.path.abspath(os.environ.get(u'PASTE_INI', u'development.ini'))
            app = loadapp(u'config:{}#main'.format(conf_file_path))
            environment.setup_environment()
