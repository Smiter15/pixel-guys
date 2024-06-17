import { Room, Client } from 'colyseus';
import { Schema, type, MapSchema } from '@colyseus/schema';

class Player extends Schema {
  @type("string") id: string = '';
  @type("string") name: string = '';
  @type("number") x: number = 190;
  @type("number") y: number = 390;
}

class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}

export class MyRoom extends Room<GameState> {
  onCreate(options: any) {
    console.log('MyRoom created!', options);
    this.setState(new GameState());

    // Registering message handlers
    this.onMessage('move', (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x += message.dx;
        player.y += message.dy;
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(`On join ${client.sessionId} joined!`, options);
    const player = new Player();
    player.id = client.sessionId;
    player.name = options.name; // Ensure name is provided
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);
  }
}
