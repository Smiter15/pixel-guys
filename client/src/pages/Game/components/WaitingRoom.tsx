import { Player } from '../../../../../types';

interface WaitingRoomProps {
  players: Player[];
  expectedPlayers: number;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  players,
  expectedPlayers,
}) => {
  return (
    <div>
      <h2>
        {players.length}/{expectedPlayers} players
      </h2>
      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default WaitingRoom;
