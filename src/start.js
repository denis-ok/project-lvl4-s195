import app from './';
import { initModels, addDummyData } from './initModels';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await initModels();
  await addDummyData();

  app().listen(PORT);
  console.log('Listening on port number:', PORT);
};

start();

