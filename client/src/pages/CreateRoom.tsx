import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState<string>('');
  const navigate = useNavigate();

  const handleCreate = () => {
    if (roomName.trim()) {
      // Assuming the server generates a room ID
      const roomId = '123'; // Replace this with the real room ID from the server
      navigate(`/game/${roomId}`);
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
      <button onClick={handleCreate}>Create Room</button>
    </div>
  );
};

export default CreateRoom;
