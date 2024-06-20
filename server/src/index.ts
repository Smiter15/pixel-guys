import { Server, matchMaker } from 'colyseus';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { MyRoom } from './rooms/MyRoom';

const app = express();
const port = 8000;

app.use(cors());

const gameServer = new Server({
  server: createServer(app),
});

app.get('/create-room', async (req, res) => {
  try {
    const room = await matchMaker.createRoom('my_room', {});
    res.send({ roomId: room.roomId });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).send('Error creating room');
  }
});

app.get('/join-room/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    await matchMaker.joinOrCreate('my_room', { roomId });
    res.send({ roomId });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(404).send('Room not found');
  }
});

gameServer.define('my_room', MyRoom);

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
