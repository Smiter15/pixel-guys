import React, { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

import { Player } from '../../../../types';

import { getOrdinalSuffix, throttle } from '../../utils';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const PLAYER_SIZE = 10;
const STEP = 3;

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

  const throttledPlayerMove = useCallback(
    throttle((dx: number, dy: number) => {
      socket.emit('playerMove', { dx, dy });
    }, 50),
    [socket]
  );

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

      leaderboard.forEach((player, index) => {
        ctx.fillStyle = player.id === socket.id ? 'blue' : 'red';
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
  }, [leaderboard, socket.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    let lastMove = 0;
    const movePlayer = (timestamp: number) => {
      const interval = 20;
      if (timestamp - lastMove >= interval) {
        let dx = 0,
          dy = 0;

        if (keysPressed.current['ArrowUp']) dy -= STEP;
        if (keysPressed.current['ArrowDown']) dy += STEP;
        if (keysPressed.current['ArrowLeft']) dx -= STEP;
        if (keysPressed.current['ArrowRight']) dx += STEP;

        const canvas = canvasRef.current;
        if (canvas) {
          const player = playersRef.current.find((p) => p.id === socket.id);
          if (player) {
            if (player.x + dx < 0 || player.x + dx > CANVAS_WIDTH - PLAYER_SIZE)
              dx = 0;
            if (
              player.y + dy < 0 ||
              player.y + dy > CANVAS_HEIGHT - PLAYER_SIZE
            )
              dy = 0;
          }
        }

        if (dx !== 0 || dy !== 0) {
          throttledPlayerMove(dx, dy);
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
  }, [socket, playersRef, throttledPlayerMove]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
};

export default GameCanvas;
