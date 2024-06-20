import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';

const HomePage: React.FC = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [expectedPlayers, setExpectedPlayers] = useState(2); // Default to 2 players
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    if (!name) {
      alert('Please enter your name');
      return;
    }
    try {
      const response = await axios.post('/create-room', { expectedPlayers });
      const { roomId } = response.data;
      navigate(`/game?roomId=${roomId}&name=${name}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinGame = async () => {
    if (!name) {
      alert('Please enter your name');
      return;
    }
    if (!roomId) {
      alert('Please enter a room ID');
      return;
    }
    try {
      const response = await axios.get(`/join-room/${roomId}`);
      if (response.data.roomId) {
        navigate(`/game?roomId=${roomId}&name=${name}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Room not found');
    }
  };

  return (
    <div>
      <h1>Welcome to the Game</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <input
        type="number"
        value={expectedPlayers}
        onChange={(e) => setExpectedPlayers(parseInt(e.target.value))}
        placeholder="Number of Players"
        min="2"
      />
      <button onClick={handleCreateGame}>Create Game</button>
      <div>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
        />
        <button onClick={handleJoinGame}>Join Game</button>
      </div>
    </div>
  );
};

export default HomePage;
