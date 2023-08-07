import type { OnReceiveFunctionHandler, Socket } from "#/socket";

export class MessageManager {

  private socket: Socket;

  private prefix;

  constructor(socket: Socket, prefix = "") {
    this.socket = socket;
    this.prefix = prefix;
  }

  public setPrefix = (prefix: string): void => {
    this.prefix = prefix;
  };

  public getPrefix = (): string => {
    return this.prefix;
  };

  public addMessageHandler = (handler: OnReceiveFunctionHandler<"message">): void => {
    this.socket.on("message", handler);
  };

  public sendMessage = (message: string): void => {
    this.socket.emit("message", { message: `${this.prefix}${message}` });
  };

}