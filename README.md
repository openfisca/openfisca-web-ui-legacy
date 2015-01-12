# OpenFisca Web User Interface

[![Build Status](https://travis-ci.org/openfisca/openfisca-web-ui.svg?branch=master)](https://travis-ci.org/openfisca/openfisca-web-ui)

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
Some software might be installed by default, please check.

```
git clone https://github.com/openfisca/openfisca-web-ui.git
cd openfisca_web_ui
python setup.py compile_catalog
pip install --user --editable .
python openfisca_web_ui/scripts/setup_app.py development-france.ini
npm install
make build
```

OpenFisca-Web-UI is a client of the [OpenFisca-Web-API](https://github.com/openfisca/openfisca-web-api)
(called with AJAX requests).

You can either use the official API instance (`http://api.openfisca.fr/``) or install an instance on your machine
if you need to work on the code of either the [API](https://github.com/openfisca/openfisca-web-api),
the [Core](https://github.com/openfisca/openfisca-core)
or the tax-benefit system ([OpenFisca-France](https://github.com/openfisca/openfisca-france) for example).
In this case please read the [installation documentation](http://www.openfisca.fr/installation).

## Run the server

Depending on your OS you might run the [MongoDB](http://www.mongodb.org/) server by hand.

Run the web server of the API:

```
cd openfisca_web_api
paster serve --reload development-france.ini
```

Run the web server of the UI (in another terminal tab since the previous one is blocked by the previous web server):

```
cd openfisca_web_ui
paster serve --reload development.ini
```

Open the URL http://localhost:2015/ in your browser.

## Development

If you change the Python source code, the web server will reload and you'll have to reload the page in your browser.

If you'd like to change the JavaScript source code, it is recommended to use the "watcher" to rebuild the code automatically:

	make watch
