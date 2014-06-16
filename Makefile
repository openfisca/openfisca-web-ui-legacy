.PHONY: clean flake8 install jshint

STATIC_DIR=openfisca_web_ui/static
BUNDLE_JS=${STATIC_DIR}/js/bundle.js

all: check test

check: flake8 jshint

clean:
	rm -Rf cache/templates/
	find -name '*.pyc' -exec rm \{\} \;
	rm -f $(BUNDLE_JS)

flake8: clean
	flake8

install:
	npm install
	cd ${STATIC_DIR}; if [ ! -e node_modules ]; then ln -s ../../node_modules .; fi

jshint: clean
	jsxhint ${STATIC_DIR}/js | sed 's/ line \([0-9]\+\), col \([0-9]\+\), /\1:\2:/'

test:
	python setup.py test
