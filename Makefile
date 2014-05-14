.PHONY: clean flake8 jshint

MAIN_BUILT_JS=openfisca_web_ui/static/js/main-built.js

all: clean flake8 jshint test

build-js:
	./openfisca_web_ui/scripts/generate_build_js.py > build.js && r.js -o build.js && /bin/rm build.js

clean:
	rm -Rf cache/templates/
	find -name '*.pyc' -exec rm \{\} \;
	rm -f $(MAIN_BUILT_JS)

flake8:
	flake8

jshint:
	jshint --exclude $(MAIN_BUILT_JS) openfisca_web_ui/static/js | \
		sed 's/ line \([0-9]\+\), col \([0-9]\+\), /\1:\2:/'

test:
	python setup.py test
