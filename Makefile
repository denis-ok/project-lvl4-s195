start:
	npm run babel-node -- ./index.js

start-nodemon:
	npm run nodemon -- --exec babel-node ./index.js

start-debug:
	DEBUG=app:* npm run nodemon -- --watch . --ext '.js' --exec babel-node ./index.js

build:
	rm -rf dist
	npm run build

test:
	npm test	

lint:
	npm run eslint .

