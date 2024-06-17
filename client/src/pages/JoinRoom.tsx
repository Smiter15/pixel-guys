import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Colyseus from 'colyseus.js';

const client = new Colyseus.Client('ws://localhost:8000');

const JoinRoom: React.FC = () => {
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (roomCode.trim() && playerName.trim()) {
      try {
        const room = await client.joinById(roomCode, { name: playerName });
        navigate(`/game/${room.id}`);
      } catch (error) {
        console.error('Failed to join room:', error);
        alert('Failed to join room. Please check the room code and try again.');
      }
    } else {
      console.log('Room code and player name are required to join a room.');
    }
  };

  return (
    <div className="join-room">
      <h1>Join a Room</h1>
      <input
        type="text"
        placeholder="Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={handleJoin}>Join Room</button>
    </div>
  );
};

export default JoinRoom;
