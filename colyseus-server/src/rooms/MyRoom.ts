import { Room, Client, CloseCode, ClientArray } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState.js";

export class MyRoom extends Room {
  maxClients = 4;
  state = new MyRoomState();

  messages = {
    yourMessageType: (client: Client, message: any) => {
      /**
       * Handle "yourMessageType" message.
       */
      console.log(client.sessionId, "sent a message:", message);
    }
  }

  onCreate (options: any) {
    /**
     * Called when a new room is created.
     */
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const playerNumber = this.tryAddPlayer(client)
  }

  onLeave (client: Client, code: CloseCode) {
    /**
     * Called when a client leaves the room.
     */
    console.log(client.sessionId, "left!", code);
  }

  onDispose() {
    /**
     * Called when the room is disposed.
     */
    console.log("room", this.roomId, "disposing...");
  }

  tryAddPlayer(client:Client):number{
      if(this.clients[0].sessionId == client.sessionId){
          client.send('playerAssignment', 1)
          return 1;
          // this.sendGameState(socket)
      }else if(this.clients[1].sessionId == client.sessionId){
          client.send('playerAssignment', 2)
          return 2;
          // this.sendGameState(socket)
      }else{
          client.send('playerAssignment', 0)
          return 0;
      }
  }
}
