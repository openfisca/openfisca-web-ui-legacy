.PHONY: clean flake8 jshint

STATIC_DIR=openfisca_web_ui/static

all: check test

build-dev:
	./node_modules/.bin/gulp dev

build-prod:
	./node_modules/.bin/gulp prod

check: flake8 jshint

clean:
	rm -Rf cache/templates/
	find -name '*.pyc' -exec rm \{\} \;
	./node_modules/.bin/gulp clean

ctags:
	ctags --recurse=yes --exclude=node_modules --exclude=openfisca_web_ui/static/dist .

flake8: clean
	flake8 --exclude node_modules

jshint: clean
	./node_modules/.bin/jsxhint ${STATIC_DIR}/js | sed 's/ line \([0-9]\+\), col \([0-9]\+\), /\1:\2:/'

test:
	python setup.py test

update-i18n: update-i18n-js update-i18n-python

update-i18n-python:
	python setup.py extract_messages update_catalog

update-i18n-js:
	./openfisca_web_ui/scripts/extract_i18n_json_messages.py --all

watch:
	./node_modules/.bin/gulp watch
