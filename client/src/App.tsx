import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';
import { Player } from '../../types';

const socket: Socket = io('http://localhost:8000');

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playersRef = useRef<Player[]>([]);
  const [name, setName] = useState<string>('');
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket.id);
    });

    socket.on('playersUpdate', (data: Player[]) => {
      playersRef.current = data; // Update the ref whenever players state changes
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('connect');
      socket.off('playersUpdate');
      socket.off('disconnect');
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    canvas.style.backgroundColor = '#D3D3D3';

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw start line
      ctx.fillStyle = 'green';
      ctx.fillRect(0, 390, canvas.width, 10);

      // Draw finish line
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, canvas.width, 10);

      playersRef.current.forEach((player) => {
        ctx.fillStyle = player.id === socket.id ? 'blue' : 'red';
        ctx.fillRect(player.x, player.y, 10, 10);

        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x + 5, player.y - 2);
      });

      requestAnimationFrame(render);
    };

    render();
  }, []);

  const joinGame = () => {
    if (name.trim()) {
      socket.emit('playerJoin', name);
    } else {
      console.log('Name is required to join the game.');
    }
  };

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
      const interval = 20; // interval for movement updates
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
  }, []);

  return (
    <div className="App">
      <h1>Socket.IO Test</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={joinGame}>Join Game</button>
      <canvas ref={canvasRef} width="400" height="400" />
    </div>
  );
};

export default App;
