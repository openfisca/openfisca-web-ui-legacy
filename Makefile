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

flake8: clean
	flake8 --exclude node_modules

jshint: clean
	./node_modules/.bin/jsxhint ${STATIC_DIR}/js | sed 's/ line \([0-9]\+\), col \([0-9]\+\), /\1:\2:/'

test:
	python setup.py test
	./node_modules/.bin/jasmine-node openfisca_web_ui/static/js/spec/

watch:
	./node_modules/.bin/gulp watch
