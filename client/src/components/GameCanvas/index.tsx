import React, { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

import { Player } from '../../../../types';

import { getOrdinalSuffix } from '../../utils';

interface GameCanvasProps {
  socket: Socket;
  playersRef: React.MutableRefObject<Player[]>;
  leaderboard: Player[];
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  socket,
  playersRef,
  leaderboard,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'green';
      ctx.fillRect(0, 390, canvas.width, 10);

      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, canvas.width, 10);

      leaderboard.forEach((player, index) => {
        ctx.fillStyle = player.id === socket.id ? 'blue' : 'red';
        ctx.fillRect(player.x, player.y, 10, 10);

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
  }, [playersRef, socket, leaderboard]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    let lastMove = 0;
    const step = 2;
    const movePlayer = (timestamp: number) => {
      const interval = 20;
      if (timestamp - lastMove >= interval) {
        let dx = 0,
          dy = 0;

        if (keysPressed.current['ArrowUp']) dy -= step;
        if (keysPressed.current['ArrowDown']) dy += step;
        if (keysPressed.current['ArrowLeft']) dx -= step;
        if (keysPressed.current['ArrowRight']) dx += step;

        const canvas = canvasRef.current;
        if (canvas) {
          const player = playersRef.current.find((p) => p.id === socket.id);
          if (player) {
            if (player.x + dx < 0 || player.x + dx > canvas.width - 10) dx = 0;
            if (player.y + dy < 0 || player.y + dy > canvas.height - 10) dy = 0;
          }
        }

        if (dx !== 0 || dy !== 0) {
          socket.emit('playerMove', { dx, dy });
          lastMove = timestamp;
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
  }, [socket, playersRef]);

  return <canvas ref={canvasRef} width="400" height="400" />;
};

export default GameCanvas;
