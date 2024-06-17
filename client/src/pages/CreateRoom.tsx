import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Colyseus from 'colyseus.js';

const client = new Colyseus.Client('ws://localhost:8000');

const CreateRoom: React.FC = () => {
  const [roomName, setRoomName] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (roomName.trim() && playerName.trim()) {
      try {
        const room = await client.create('my_room', { roomName, name: playerName });
        navigate(`/game/${room.id}`);
      } catch (error) {
        console.error('Failed to create room:', error);
      }
    } else {
      console.log('Room name and player name are required to create a room.');
    }
  };

  return (
    <div className="create-room">
      <h1>Create a Room</h1>
      <input
        type="text"
        placeholder="Room Name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={handleCreate}>Create Room</button>
    </div>
  );
};

export default CreateRoom;
