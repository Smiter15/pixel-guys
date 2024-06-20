import React from 'react';

import { calculateFinalRankings, getOrdinalSuffix } from '../utils';

import { Player } from '../../../../../types';

interface PlayerListProps {
  players: Player[];
  raceFinished?: boolean;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, raceFinished }) => {
  if (raceFinished) {
    const rankedPlayers = calculateFinalRankings(players).map(
      (player, index) => ({
        ...player,
        rank: index + 1,
      })
    );

    players = rankedPlayers;
  }

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
