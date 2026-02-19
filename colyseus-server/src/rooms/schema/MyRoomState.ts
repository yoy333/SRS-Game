import { ArraySchema, Schema, type } from "@colyseus/schema";

export class MyRoomState extends Schema {

  @type(["string"]) turnHistory = new ArraySchema<string>();

}
