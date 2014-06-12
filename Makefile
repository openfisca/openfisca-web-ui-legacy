.PHONY: clean flake8 jshint

BUNDLE_JS=openfisca_web_ui/static/js/bundle.js

all: clean flake8 jshint test

clean:
	rm -Rf cache/templates/
	find -name '*.pyc' -exec rm \{\} \;
	rm -f $(BUNDLE_JS)

flake8:
	flake8

jshint:
	jshint openfisca_web_ui/static/js | sed 's/ line \([0-9]\+\), col \([0-9]\+\), /\1:\2:/'
#	jshint --exclude $(MAIN_BUILT_JS) openfisca_web_ui/static/js | \
#		sed 's/ line \([0-9]\+\), col \([0-9]\+\), /\1:\2:/'

test:
	python setup.py test
