SHELL := /bin/bash
export

.DEFAULT_GOAL := help

.PHONY: install
install:
	npm install

.PHONY: build
build: ## build js from typescript file
	${MAKE} clean
	npx tsc

.PHONY: parse
parse: ## parse built js file into bookmarklet
	@echo 'javascript: (function () {' > "js/scrap_web_page.js"
	@cat "build/scrap_web_page.js" >> "js/scrap_web_page.js"
	@echo '})();' >> "js/scrap_web_page.js"

.PHONY: clean
clean:
	-rm -rf "build"

.PHONY: help
help:  ## show help
	@cat $(MAKEFILE_LIST) \
		| grep -E '^[.a-zA-Z0-9_-]+ *:.*##.*' \
		| xargs -I'<>' \
			bash -c "\
				printf '<>' | awk -F'[:]' '{ printf \"\033[36m%-15s\033[0m\", \$$1 }'; \
				printf '<>' | awk -F'[##]' '{ printf \"%s\n\", \$$3 }'; \
			"
