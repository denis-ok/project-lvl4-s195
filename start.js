import app from './';

const PORT = process.env.PORT || 5000;

app().listen(PORT);
console.log('Listening on port number:', PORT);
