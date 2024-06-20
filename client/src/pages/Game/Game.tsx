import React, { useEffect, useState, useMemo } from 'react';
import { Client, Room } from 'colyseus.js';
import { useLocation } from 'react-router-dom';
import useInput from './components/useInput';
import Canvas from './components/Canvas';
import PlayerList from './components/PlayerList';

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SIZE,
  STEP,
  checkHorizontalCollision,
  checkVerticalCollision,
  normalizeMovement,
  calculatePlayerRankings,
} from './utils';

import './Game.css';

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

const obstacles: Obstacle[] = [
  { x: 100, y: 100, width: 50, height: 50 },
  { x: 200, y: 200, width: 50, height: 50 },
  // Add more obstacles as needed
];

const Game: React.FC = () => {
  const [players, setPlayers] = useState<
    { id: string; name: string; x: number; y: number; rank: number }[]
  >([]);
  const [name, setName] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const client = useMemo(() => new Client('ws://localhost:8000'), []);
  const keysPressed = useInput();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomId = params.get('roomId');
    const playerName = params.get('name');

    if (playerName) {
      setName(playerName);
    }

    if (roomId && playerName) {
      const joinRoom = async () => {
        try {
          const newRoom = await client.joinById(roomId, { name: playerName });
          setRoom(newRoom);

          newRoom.onMessage('players', (players: any) => {
            const rankedPlayers = calculatePlayerRankings(players).map(
              (player, index) => ({
                ...player,
                rank: index + 1,
              })
            );
            setPlayers(rankedPlayers);
          });

          // Send player name only once after joining
          newRoom.send('addPlayer', { name: playerName });
        } catch (error) {
          console.error('Failed to join room:', error);
        }
      };

      joinRoom();
    }
  }, [location.search, client]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!room || !name) return;

      let dx = 0,
        dy = 0;
      if (keysPressed.current['ArrowUp']) dy -= STEP;
      if (keysPressed.current['ArrowDown']) dy += STEP;
      if (keysPressed.current['ArrowLeft']) dx -= STEP;
      if (keysPressed.current['ArrowRight']) dx += STEP;

      ({ dx, dy } = normalizeMovement(dx, dy, STEP));

      if (dx !== 0 || dy !== 0) {
        const player = players.find((p) => p.name === name);
        if (player) {
          let newX = player.x + dx;
          let newY = player.y + dy;

          // Check for boundary collisions
          if (newX < 0) newX = 0;
          if (newX > CANVAS_WIDTH - PLAYER_SIZE)
            newX = CANVAS_WIDTH - PLAYER_SIZE;
          if (newY < 0) newY = 0;
          if (newY > CANVAS_HEIGHT - PLAYER_SIZE)
            newY = CANVAS_HEIGHT - PLAYER_SIZE;

          // Check for horizontal and vertical collisions
          const { collides: horizontalCollides, newX: adjustedX } =
            checkHorizontalCollision(newX, player.y, obstacles);
          if (horizontalCollides) {
            newX = adjustedX;
          }

          const { collides: verticalCollides, newY: adjustedY } =
            checkVerticalCollision(player.x, newY, obstacles);
          if (verticalCollides) {
            newY = adjustedY;
          }

          room.send('move', { name, x: newX, y: newY });
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [room, name, players, keysPressed]);

  return (
    <div>
      <h1>Players in Room</h1>
      {!room && (
        <div>
          <p>Loading...</p>
        </div>
      )}
      {room && (
        <div>
          <Canvas players={players} name={name} obstacles={obstacles} />
          <PlayerList players={players} />
        </div>
      )}
    </div>
  );
};

export default Game;
