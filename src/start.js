import app from './';
import initModels from './initModels';

initModels();

const PORT = process.env.PORT || 5000;

app().listen(PORT);
console.log('Listening on port number:', PORT);
