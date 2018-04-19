start:
	npm run babel-node -- ./start.js

start-nodemon:
	npm run nodemon -- --exec babel-node ./start.js

start-debug:
	DEBUG=app:* npm run nodemon -- --watch . --ext '.js, .pug' --exec babel-node ./start.js

build-webpack:
	npm run webpack

test:
	npm test

test-watch:
	npm test -- --watch

test-coverage:
	npm test -- --coverage

lint:
	npm run eslint .

