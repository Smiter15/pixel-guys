import React, { useEffect, useRef } from 'react';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SIZE,
  getOrdinalSuffix,
} from '../utils';

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  rank: number;
}

interface CanvasProps {
  players: Player[];
  name: string;
  obstacles: Obstacle[];
}

const Canvas: React.FC<CanvasProps> = ({ players, name, obstacles }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw start and finish lines
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT - PLAYER_SIZE);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - PLAYER_SIZE);
      ctx.stroke();

      ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(0, PLAYER_SIZE);
      ctx.lineTo(CANVAS_WIDTH, PLAYER_SIZE);
      ctx.stroke();

      // Draw obstacles
      ctx.fillStyle = 'gray';
      obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });

      players.forEach((player) => {
        ctx.fillStyle = player.name === name ? 'blue' : 'red';
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);

        // Draw player name and rank
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';

        ctx.fillText(player.name, player.x + PLAYER_SIZE / 2, player.y + 20);
        ctx.fillText(
          `${getOrdinalSuffix(player.rank)}`,
          player.x + PLAYER_SIZE / 2,
          player.y + PLAYER_SIZE - 15
        );
      });

      requestAnimationFrame(render);
    };

    render();
  }, [players, name, obstacles]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
};

export default Canvas;
