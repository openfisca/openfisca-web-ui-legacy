# OpenFisca Web User Interface

[![Build Status](https://travis-ci.org/openfisca/openfisca-web-ui.svg?branch=master)](https://travis-ci.org/openfisca/openfisca-web-ui)
[![Dependency Status](https://david-dm.org/openfisca/openfisca-web-ui.svg)](https://david-dm.org/openfisca/openfisca-web-ui)
[![devDependency Status](https://david-dm.org/openfisca/openfisca-web-ui/dev-status.svg)](https://david-dm.org/openfisca/openfisca-web-ui#info=devDependencies)

Web user interface for [OpenFisca](http://www.openfisca.fr/) -- a versatile microsimulation free software

See also: [OpenFisca documentation](http://doc.openfisca.fr/)

OpenFisca-Web-UI is a client of the [OpenFisca-Web-API](https://github.com/openfisca/openfisca-web-api)
(called with AJAX requests).

## Installation

Clone the git repo, then:

```
npm install
```

You can either use the official API instance (`http://api.openfisca.fr`) or install an instance on your machine
if you need to work on the code of either the [API](https://github.com/openfisca/openfisca-web-api),
the [Core](https://github.com/openfisca/openfisca-core)
or the tax-benefit system ([OpenFisca-France](https://github.com/openfisca/openfisca-france) for example).
In this case please read the [installation documentation](http://www.openfisca.fr/installation).

## Configuration

TODO

## Run the server

```
npm start
```

Open http://localhost:2020/ in your browser.
