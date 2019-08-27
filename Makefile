install:
	npm install
watch:
	npm run test -- --watch
test:
	npm run test -- --coverage
lint:
	npx eslint .
start:
	npx babel-node src/bin/gendiff.js

build:
	npm run build