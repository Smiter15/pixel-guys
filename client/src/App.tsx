import React, { useEffect, useRef, useState } from 'react';
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
  const [isRaceReady, setIsRaceReady] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const requiredPlayerCount = 2;

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

    socket.on('raceReady', () => {
      setIsRaceReady(true);
      startCountdown();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('connect');
      socket.off('playersUpdate');
      socket.off('leaderboardUpdate');
      socket.off('raceReady');
      socket.off('disconnect');
    };
  }, []);

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        // setIsRaceReady(false);
      }
    }, 1000);
  };

  const joinGame = () => {
    if (name.trim()) {
      socket.emit('playerJoin', name);
    } else {
      console.log('Name is required to join the game.');
    }
  };

  return (
    <div className="App">
      {!isRaceReady && (
        <>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={joinGame}>Join Game</button>
        </>
      )}

      {!isRaceReady && countdown === null ? (
        <div className="pending">
          <p>Waiting for players...</p>
          <p>
            {playersRef.current.length} / {requiredPlayerCount} players ready
          </p>
          <ul>
            {playersRef.current.map((player) => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
        </div>
      ) : countdown !== null ? (
        <div className="countdown">Starting in {countdown}</div>
      ) : (
        <>
          <GameCanvas
            socket={socket}
            playersRef={playersRef}
            leaderboard={leaderboard}
          />
          <Leaderboard leaderboard={leaderboard} />
        </>
      )}
    </div>
  );
};

export default App;
