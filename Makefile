.PHONY: clean flake8

all: flake8

clean:
	rm -Rf cache/templates/
	find -name '*.pyc' -exec rm \{\} \;

flake8: clean
	flake8

