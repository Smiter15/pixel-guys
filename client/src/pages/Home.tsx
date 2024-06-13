import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  const handleJoinRoom = () => {
    // Implement join room logic
  };

  return (
    <div className="home">
      <h1>Welcome to the Game</h1>
      <button onClick={handleCreateRoom}>Create a Room</button>
      <button onClick={handleJoinRoom}>Join a Room</button>
    </div>
  );
};

export default Home;
