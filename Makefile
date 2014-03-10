.PHONY: clean flake8 jshint

all: clean flake8 jshint

clean:
	rm -Rf cache/templates/
	find -name '*.pyc' -exec rm \{\} \;

flake8:
	flake8

jshint:
	jshint openfisca_web_ui/static/js | sed 's/ line \([0-9]\+\), col \([0-9]\+\), /\1:\2:/'
