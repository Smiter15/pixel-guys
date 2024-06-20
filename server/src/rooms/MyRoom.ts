import { Room, Client } from 'colyseus';
import { Schema, type, ArraySchema } from '@colyseus/schema';

class Player extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') x: number = 290;
  @type('number') y: number = 390;
  @type('number') finishTime: number = 0;
  @type('boolean') playAgain: boolean = false;
}

class RaceState extends Schema {
  @type('number') countdown: number = 0;
  @type('boolean') raceStarted: boolean = false;
  @type('boolean') raceFinished: boolean = false;
  @type([Player]) players = new ArraySchema<Player>();
  @type('number') expectedPlayers: number = 0;
}

export class MyRoom extends Room<RaceState> {
  onCreate(options: any) {
    this.setState(new RaceState());
    this.state.expectedPlayers = options.expectedPlayers;

    this.onMessage('addPlayer', (client, message) => {
      const player = new Player();
      player.id = client.sessionId; // Assign session ID as player ID
      player.name = message.name;
      this.state.players.push(player);
      this.broadcast('players', this.state.players);

      if (this.state.players.length === this.state.expectedPlayers) {
        this.startCountdown();
      }
    });

    this.onMessage('move', (client, message) => {
      const player = this.state.players.find(
        (player) => player.id === client.sessionId
      );
      if (player && this.state.raceStarted && !this.state.raceFinished) {
        player.x = message.x;
        player.y = message.y;

        // Check if player reached the finish line
        if (player.y <= 0) {
          if (player.finishTime === 0) {
            player.finishTime = Date.now() - this.state.countdown;
          }

          if (this.state.players.every((p) => p.finishTime > 0)) {
            this.state.raceFinished = true;
            this.broadcast('raceFinished', this.state.players);
          }
        }

        this.broadcast('players', this.state.players);
      }
    });

    this.onMessage('playAgain', (client, message) => {
      const player = this.state.players.find((p) => p.id === client.sessionId);
      if (player) {
        player.playAgain = true;
        this.broadcast('players', this.state.players);
        this.checkPlayAgainReadiness();
      }
    });
  }

  startCountdown() {
    this.state.countdown = 4;
    const countdownInterval = setInterval(() => {
      this.state.countdown -= 1;
      this.broadcast('countdown', this.state.countdown);

      if (this.state.countdown <= 0) {
        clearInterval(countdownInterval);
        this.startRace();
      }
    }, 1000);
  }

  startRace() {
    this.state.raceStarted = true;
    this.state.countdown = Date.now();
    this.broadcast('raceStarted');
  }

  playAgain() {
    this.state.raceStarted = false;
    this.state.raceFinished = false;
    this.state.countdown = 0;
    this.state.players.forEach((player) => {
      player.x = 290;
      player.y = 390;
      player.finishTime = 0;
      player.playAgain = false;
    });
    this.broadcast('players', this.state.players);
    this.startCountdown();
  }

  checkPlayAgainReadiness() {
    if (this.state.players.every((player) => player.playAgain)) {
      this.playAgain();
    }
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');
    client.send('expectedPlayers', this.state.expectedPlayers);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
    this.state.players = new ArraySchema(
      ...this.state.players.filter((player) => player.id !== client.sessionId)
    );
    this.broadcast('players', this.state.players);
  }
}
