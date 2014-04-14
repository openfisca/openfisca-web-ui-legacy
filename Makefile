.PHONY: clean flake8 jshint

all: clean flake8 jshint test

build-js:
	./openfisca_web_ui/scripts/generate_build_js.py > build.js && r.js -o build.js && /bin/rm build.js

clean:
	rm -Rf cache/templates/
	find -name '*.pyc' -exec rm \{\} \;

flake8:
	flake8

jshint:
	jshint --exclude openfisca_web_ui/static/js/main-built.js openfisca_web_ui/static/js | \
		sed 's/ line \([0-9]\+\), col \([0-9]\+\), /\1:\2:/'

test:
	python setup.py test
