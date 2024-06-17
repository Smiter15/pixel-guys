import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Client, Room } from 'colyseus.js';

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SIZE,
  STEP,
  checkHorizontalCollision,
  checkVerticalCollision,
  normalizeMovement,
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
    { id: string; name: string; x: number; y: number }[]
  >([]);
  const [name, setName] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const client = useMemo(() => new Client('ws://localhost:8000'), []);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const joinRoom = async () => {
    if (!name) return alert('Please enter a name');
    try {
      const newRoom = await client.joinOrCreate('my_room', { name });
      setRoom(newRoom);

      newRoom.onMessage('players', (players: any) => {
        setPlayers(players);
      });

      // Send player name only once after joining
      newRoom.send('addPlayer', { name });
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    keysPressed.current[event.key] = true;
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    keysPressed.current[event.key] = false;
  };

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
    }, 50); // Adjust the interval time as needed

    return () => clearInterval(interval);
  }, [room, name, players]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw obstacles
      ctx.fillStyle = 'gray';
      obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });

      players.forEach((player) => {
        ctx.fillStyle = player.name === name ? 'blue' : 'red';
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

        // Draw player name
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x + PLAYER_SIZE / 2, player.y - 5);
      });

      requestAnimationFrame(render);
    };

    render();
  }, [players, name]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div>
      <h1>Players in Room</h1>
      {!room && (
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      )}
      {room && (
        <div>
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
          <ul>
            {players.map((player, index) => (
              <li key={index}>
                {player.name} - Position: ({player.x}, {player.y})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Game;
