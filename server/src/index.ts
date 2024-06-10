import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { Player } from '../../types';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const players: { [id: string]: Player } = {};

io.on('connection', (socket) => {
  console.log(`a user connected: ${socket.id}`);

  socket.on('playerJoin', (name: string) => {
    console.log(`playerJoin: ${name}`);
    players[socket.id] = {
      id: socket.id,
      x: 190,
      y: 390,
      name,
      score: 0,
    };
    io.emit('playersUpdate', Object.values(players));
  });

  socket.on('playerMove', (data: { dx: number; dy: number }) => {
    const player = players[socket.id];
    if (player) {
      player.x += data.dx;
      player.y += data.dy;
      io.emit('playersUpdate', Object.values(players));
    }
  });

  socket.on('disconnect', () => {
    console.log(`user disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('playersUpdate', Object.values(players));
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});