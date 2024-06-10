import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

import Leaderboard from './components/Leaderboard';
import GameCanvas from './components/GameCanvas';

import './App.css';

import { Player } from '../../types';

const socket: Socket = io('http://localhost:8000');

const App: React.FC = () => {
  const playersRef = useRef<Player[]>([]);
  const [name, setName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket.id);
    });

    socket.on('playersUpdate', (data: Player[]) => {
      playersRef.current = data;
    });

    socket.on('leaderboardUpdate', (data: Player[]) => {
      setLeaderboard(data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('connect');
      socket.off('playersUpdate');
      socket.off('leaderboardUpdate');
      socket.off('disconnect');
    };
  }, []);

  const joinGame = useCallback(() => {
    socket.emit('playerJoin', name);
  }, [name]);

  return (
    <div className="App">
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={joinGame}>Join Game</button>

      <GameCanvas
        socket={socket}
        playersRef={playersRef}
        leaderboard={leaderboard}
      />

      <Leaderboard leaderboard={leaderboard} />
    </div>
  );
};

export default App;
