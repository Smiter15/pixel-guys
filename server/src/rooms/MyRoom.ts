import { Room, Client } from 'colyseus';
import { Schema, type, ArraySchema } from '@colyseus/schema';

class Player extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') x: number = 290;
  @type('number') y: number = 390;
  @type('number') finishTime: number = 0; // Time taken to finish the race
}

class RaceState extends Schema {
  @type('number') countdown: number = 0;
  @type('boolean') raceStarted: boolean = false;
  @type('boolean') raceFinished: boolean = false;
  @type([Player]) players = new ArraySchema<Player>();
  @type('number') expectedPlayers: number = 0; // Number of expected players
}

export class MyRoom extends Room<RaceState> {
  onCreate(options: any) {
    this.setState(new RaceState());
    this.state.expectedPlayers = options.expectedPlayers || 2; // Default to 2 players if not provided

    this.onMessage('addPlayer', (client, message) => {
      const player = new Player();
      player.id = client.sessionId; // Assign session ID as player ID
      player.name = message.name;
      this.state.players.push(player);
      this.broadcast('players', this.state.players);

      // Start countdown when all expected players have joined
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
            console.log('finish time', Date.now() - this.state.countdown);
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
    console.log('start time', this.state.countdown);
    this.broadcast('raceStarted');
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
