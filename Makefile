all: test

build-dev: install-npm compile-i18n-python
	./node_modules/.bin/gulp dev

build-prod: install-npm compile-i18n-python
	./node_modules/.bin/gulp prod

clean: clean-js-dist clean-pyc
	rm -Rf cache/templates/

clean-js-dist:
	./node_modules/.bin/gulp clean:dist

clean-pyc:
	find . -name '*.pyc' -exec rm \{\} \;

compile-i18n-python:
	python setup.py compile_catalog

flake8:
	@# Do not analyse .gitignored files.
	@# `make` needs `$$` to output `$`. Ref: http://stackoverflow.com/questions/2382764.
	flake8 `git ls-files | grep "\.py$$"`

install-npm:
	npm install

poedit: update-i18n-python
	poedit openfisca_web_ui/i18n/fr/LC_MESSAGES/openfisca-web-ui.po
	make compile-i18n-python

test: flake8
	nosetests openfisca_web_ui --exe --with-doctest

update-i18n: update-i18n-js update-i18n-python

update-i18n-python:
	python setup.py extract_messages update_catalog

update-i18n-js:
	./openfisca_web_ui/scripts/extract_i18n_json_messages.py --all --no-delete-regex='.+:.+'

update-npm-modules:
	[ -f ./node_modules/.bin/npm-check-updates ] || npm install
	./node_modules/.bin/npm-check-updates -u; npm install

watch:
	./node_modules/.bin/gulp watch
