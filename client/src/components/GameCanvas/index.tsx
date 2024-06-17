import React, { useEffect, useRef } from 'react';
import { Player } from '../../../../types';
import { getOrdinalSuffix } from '../../utils';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SIZE,
  STEP,
} from './gameConstants';
import {
  checkHorizontalCollision,
  checkVerticalCollision,
} from './gameUtils';

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

const obstacles: Obstacle[] = [
  // { x: 100, y: 100, width: 50, height: 50 },
  // { x: 200, y: 200, width: 50, height: 50 },
  // Add more obstacles as needed
];

interface GameCanvasProps {
  playersRef: React.MutableRefObject<Player[]>;
  leaderboard: Player[];
  sendMessage: (type: string, data: any) => void; // Function to send messages to the server
}

const GameCanvas: React.FC<GameCanvasProps> = ({ playersRef, leaderboard, sendMessage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = 'green';
      ctx.fillRect(0, CANVAS_HEIGHT - 10, CANVAS_WIDTH, 10);

      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 10);

      // Draw obstacles
      ctx.fillStyle = 'gray';
      obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });

      leaderboard.forEach((player, index) => {
        ctx.fillStyle = player.id === 'self' ? 'blue' : 'red';
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

        const position = getOrdinalSuffix(index + 1);

        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';

        ctx.fillText(position, player.x + 5, player.y - 2);
        ctx.fillText(player.name, player.x + 5, player.y + 20);
      });

      requestAnimationFrame(render);
    };

    render();
  }, [leaderboard]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    const movePlayer = () => {
      let dx = 0,
        dy = 0;

      if (keysPressed.current['ArrowUp']) dy -= STEP;
      if (keysPressed.current['ArrowDown']) dy += STEP;
      if (keysPressed.current['ArrowLeft']) dx -= STEP;
      if (keysPressed.current['ArrowRight']) dx += STEP;

      const canvas = canvasRef.current;
      if (canvas) {
        const player = playersRef.current.find((p) => p.id === 'self');
        if (player) {
          let newX = player.x + dx;
          let newY = player.y + dy;

          // Check for boundary collisions
          if (newX < 0 || newX > CANVAS_WIDTH - PLAYER_SIZE) dx = 0;
          if (newY < 0 || newY > CANVAS_HEIGHT - PLAYER_SIZE) dy = 0;

          // Check for horizontal obstacle collisions
          const { collides: horizontalCollides, newX: adjustedX } =
            checkHorizontalCollision(newX, player.y, obstacles);
          if (horizontalCollides) {
            newX = adjustedX;
            dx = newX - player.x;
          }

          // Check for vertical obstacle collisions
          const { collides: verticalCollides, newY: adjustedY } =
            checkVerticalCollision(player.x, newY, obstacles);
          if (verticalCollides) {
            newY = adjustedY;
            dy = newY - player.y;
          }

          if (dx !== 0 || dy !== 0) {
            // Send movement updates to the server
            sendMessage('move', { dx, dy });
          }
        }
      }
      requestAnimationFrame(movePlayer);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    requestAnimationFrame(movePlayer);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playersRef, sendMessage]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
};

export default GameCanvas;
