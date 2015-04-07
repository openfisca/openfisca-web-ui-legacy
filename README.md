# OpenFisca Web User Interface

[![Build Status](https://travis-ci.org/openfisca/openfisca-web-ui.svg?branch=master)](https://travis-ci.org/openfisca/openfisca-web-ui)
[![Dependency Status](https://david-dm.org/openfisca/openfisca-web-ui.svg)](https://david-dm.org/openfisca/openfisca-web-ui)
[![devDependency Status](https://david-dm.org/openfisca/openfisca-web-ui/dev-status.svg)](https://david-dm.org/openfisca/openfisca-web-ui#info=devDependencies)

Web user interface for [OpenFisca](http://www.openfisca.fr/) -- a versatile microsimulation free software

## Documentation

Please consult the [OpenFisca documentation](http://www.openfisca.fr/documentation)

## Installation

Prerequisites:

* [git](http://git-scm.com)
* [GNU Make](http://www.gnu.org/software/make/)
* [Node.js](http://nodejs.org/)
* [MongoDB](http://www.mongodb.org/)
* [npm](https://www.npmjs.com/)
* [pip](https://pip.pypa.io/)
* [Python](https://www.python.org/)

The way to install these tools depends on your operating system (not documented here).

From the cloned repository directory:

```
pip install --user --editable .
python setup.py compile_catalog
python openfisca_web_ui/scripts/setup_app.py development-france.ini
npm install
make build-dev
```

OpenFisca-Web-UI is a client of the [OpenFisca-Web-API](https://github.com/openfisca/openfisca-web-api)
(called with AJAX requests).

You can either use the official API instance (`http://api.openfisca.fr`) or install an instance on your machine
if you need to work on the code of either the [API](https://github.com/openfisca/openfisca-web-api),
the [Core](https://github.com/openfisca/openfisca-core)
or the tax-benefit system ([OpenFisca-France](https://github.com/openfisca/openfisca-france) for example).
In this case please read the [installation documentation](http://www.openfisca.fr/installation).

## Run the server

First run the [MongoDB](http://www.mongodb.org/) server.

Configure the web API URLs in `development-france.ini`:
* to use your own instance of the web API, leave the default values
* to use the public instance of the web API, change the URLs containing `localhost:2000` by `api.openfisca.fr`

If you installed your own instance of the web API, run its web server from its directory:

  paster serve --reload development-france.ini

Then run the web server of the UI from its directory (open another terminal tab):

  paster serve --reload development-france.ini

Open the URL http://localhost:2020/ in your browser.

## Development

If you change the Python source code, the web server will reload and you'll have to reload the page in your browser.

Use the "watcher" to rebuild the code when a JavaScript file changes:

	make watch
