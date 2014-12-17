OpenFisca-Web-UI
================

Web user interface for [OpenFisca](http://www.openfisca.org/) -- a versatile microsimulation free software

[![Build Status](https://travis-ci.org/openfisca/openfisca-web-ui.svg?branch=master)](https://travis-ci.org/openfisca/openfisca-web-ui)

Installation
------------

Installation process requires some tools to be installed. For example on Debian GNU/Linux distribution, as root:

	aptitude install git python-pip npm make

Clone repository

	git clone https://github.com/openfisca/openfisca-web-ui.git

Install Python package with dependencies

	pip install --user --requirement requirements.txt
	pip install --user --editable .

Compile gettext catalogs

	python setup.py compile_catalog

Install npm dependencies for JavaScript

	npm install

Build `bundle.js` file

	make build

Run
---

OpenFisca-Web-UI requires [OpenFisca-Web-API](https://github.com/openfisca/openfisca-web-api) to run.
Please read its [documentation](http://www.openfisca.fr/documentation).

Run the local web server for the API from OpenFisca-Web-API directory:

	paster serve --reload development.ini

Then run the local web server for the UI from the OpenFisca-Web-UI directory (recommended in another terminal tab):

	paster serve --reload development.ini

Now you should open the URL http://localhost:2015/ in your browser and use the application.

If you change the Python source code, the local web server will reload and you can reload the page in your browser.

If you change the JavaScript source code, it is recommended to use the "watcher" to update the `bundle.js` file
automatically:

	make watch

Bonus: if you set `enabled.livereload = true` in `development.ini`, the "watcher" will reload the page in the browser
automatically on each JavaScript rebuild.

Database
--------

Cleanup sessions and test cases:

	mongo openfisca_web_ui --eval 'db.sessions.remove(); db.test_cases.remove()'

Dependencies
------------

* JavaScript dependencies are npm modules declared in `package.json`.
* CSS dependencies
	* https://github.com/hyspace/typeahead.js-bootstrap3.less
