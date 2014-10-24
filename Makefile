STATIC_DIR=openfisca_web_ui/static

all: check test

build-dev:
	./node_modules/.bin/gulp dev

build-prod:
	./node_modules/.bin/gulp prod

check: flake8 jshint

check-syntax-errors: clean-pyc
	@# This is a hack around flake8 not displaying E910 errors with the select option.
	test -z "`flake8 --first | grep E901`"

clean: clean-js-build clean-pyc
	rm -Rf cache/templates/

clean-js-build:
	./node_modules/.bin/gulp clean

clean-pyc:
	find -name '*.pyc' -exec rm \{\} \;

ctags:
	ctags --recurse=yes --exclude=node_modules --exclude=openfisca_web_ui/static/dist .

flake8: clean-pyc
	flake8

jshint: clean-js-build
	./node_modules/.bin/jsxhint ${STATIC_DIR}/js | sed 's/ line \([0-9]\+\), col \([0-9]\+\), /\1:\2:/'

poedit: update-i18n-python
	poedit openfisca_web_ui/i18n/fr/LC_MESSAGES/openfisca-web-ui.po


test: check-syntax-errors
	nosetests openfisca_web_ui/tests

update-i18n: update-i18n-js update-i18n-python

update-i18n-python:
	python setup.py extract_messages update_catalog

update-i18n-js:
	./openfisca_web_ui/scripts/extract_i18n_json_messages.py --all --no-delete-regex='.+:.+'

watch:
	./node_modules/.bin/gulp watch
