import { Server } from 'colyseus';
import { createServer } from 'http';
import express from 'express';

import { MyRoom } from './rooms/MyRoom';

const port = 8000;
const app = express();
const server = createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define('my_room', MyRoom);

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
