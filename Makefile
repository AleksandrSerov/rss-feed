install:
	npm install
watch:
	npm run test -- --watch
test:
	npm run test -- --coverage
lint:
	npx eslint .
start:
	npm run start
build:
	npm run build