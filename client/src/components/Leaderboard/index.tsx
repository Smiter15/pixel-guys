import { getOrdinalSuffix } from '../../utils';

import { Player } from '../../../../types';

import './Leaderboard.css';

interface LeaderboardProps {
  leaderboard: Player[];
}

const Leaderboard = ({ leaderboard }: LeaderboardProps) => {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((player, i) => (
          <li key={player.id}>
            {getOrdinalSuffix(i + 1)}:- {player.name} - Distance to finish:{' '}
            {player.y <= 0 ? 0 : player.y}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
