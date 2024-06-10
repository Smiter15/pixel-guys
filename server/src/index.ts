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
const requiredPlayerCount = 2; // Set required player count for the race to start

const calculateLeaderboard = () => {
  return Object.values(players).sort((a, b) => a.y - b.y);
};

io.on('connection', (socket) => {
  console.log(`a user connected: ${socket.id}`);

  socket.on('playerJoin', (name: string) => {
    console.log(`playerJoin: ${name}`);
    players[socket.id] = {
      id: socket.id,
      x: 190,
      y: 390,
      name,
    };

    io.emit('playersUpdate', Object.values(players));
    io.emit('leaderboardUpdate', calculateLeaderboard());

    // Check if the required number of players has been reached
    if (Object.keys(players).length === requiredPlayerCount) {
      io.emit('raceReady');
    }
  });

  socket.on('playerMove', (data: { dx: number; dy: number }) => {
    const player = players[socket.id];
    if (player) {
      player.x += data.dx;
      player.y += data.dy;

      io.emit('playersUpdate', Object.values(players));
      io.emit('leaderboardUpdate', calculateLeaderboard());
    }
  });

  socket.on('disconnect', () => {
    console.log(`user disconnected: ${socket.id}`);
    delete players[socket.id];

    io.emit('playersUpdate', Object.values(players));
    io.emit('leaderboardUpdate', calculateLeaderboard());
  });
});

httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
