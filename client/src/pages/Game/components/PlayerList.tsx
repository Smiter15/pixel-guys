import React from 'react';

import { getOrdinalSuffix } from '../utils';

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  rank: number;
}

interface PlayerListProps {
  players: Player[];
}

const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  return (
    <ul>
      {players.map((player, index) => (
        <li key={index}>
          {getOrdinalSuffix(player.rank)} - {player.name}
        </li>
      ))}
    </ul>
  );
};

export default PlayerList;
