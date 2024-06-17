import { Room, Client } from 'colyseus';
import { Schema, type, ArraySchema } from '@colyseus/schema';

class Player extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') x: number = 190;
  @type('number') y: number = 190;
}

export class MyRoom extends Room {
  @type([Player]) players = new ArraySchema<Player>();

  onCreate(options: any) {
    this.onMessage('addPlayer', (client, message) => {
      const player = new Player();
      player.id = client.sessionId; // Assign session ID as player ID
      player.name = message.name;
      this.players.push(player);
      this.broadcast('players', this.players);
    });

    this.onMessage('move', (client, message) => {
      const player = this.players.find(
        (player) => player.id === client.sessionId
      );
      if (player) {
        player.x = message.x;
        player.y = message.y;
        this.broadcast('players', this.players);
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
    this.players = new ArraySchema(
      ...this.players.filter((player) => player.id !== client.sessionId)
    );
    this.broadcast('players', this.players);
  }
}
