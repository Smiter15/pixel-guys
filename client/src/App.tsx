import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
// import CreateRoom from './pages/CreateRoom';
// import JoinRoom from './pages/JoinRoom';
import Game from './pages/Game/Game';

import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
