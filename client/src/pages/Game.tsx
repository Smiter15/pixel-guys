import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as Colyseus from 'colyseus.js';

import Leaderboard from '../components/Leaderboard';
import GameCanvas from '../components/GameCanvas';

import './Game.css';

import { Player } from '../../../types';

const client = new Colyseus.Client('ws://localhost:8000');

const Game: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const playersRef = useRef<Player[]>([]);
  const [name, setName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [isRaceReady, setIsRaceReady] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [room, setRoom] = useState<Colyseus.Room | null>(null);

  const requiredPlayerCount = 2;

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
      }
    }, 1000);
  };

  const joinGame = async () => {
    if (name.trim() && roomId) {
      try {
        const room: any = await client.joinById(roomId as string, { name });
        setRoom(room);

        room.state.players.onAdd = (player: Player, key: string) => {
          playersRef.current.push(player);
        };
        room.state.players.onRemove = (player: Player, key: string) => {
          playersRef.current = playersRef.current.filter((p) => p.id !== key);
        };

        room.onMessage('raceReady', () => {
          setIsRaceReady(true);
          startCountdown();
        });

        room.onStateChange((state: any) => {
          const players = Object.values(state.players) as Player[];
          setLeaderboard(players);
        });
      } catch (error) {
        console.error('Failed to join room:', error);
      }
    } else {
      console.log('Name is required to join the game.');
    }
  };

  useEffect(() => {
    return () => {
      if (room) {
        room.leave();
      }
    };
  }, [room]);

  return (
    <div className="game">
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
          <GameCanvas playersRef={playersRef} leaderboard={leaderboard} sendMessage={(type, data) => room?.send(type, data)} />
          <Leaderboard leaderboard={leaderboard} />
        </>
      )}
    </div>
  );
};

export default Game;
