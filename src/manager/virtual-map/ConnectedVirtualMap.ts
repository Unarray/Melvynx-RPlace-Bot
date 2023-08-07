import { VirtualMap } from "./VirtualMap";
import type { OnReceiveFunctionHandler, Socket } from "#/socket";

export class ConnectedVirtualMap extends VirtualMap {

  private socket: Socket;

  constructor(socket: Socket) {
    super();
    this.socket = socket;
  }

  public init = (): Promise<void> => {
    return new Promise((resolve) => {
      this.socket.on("init", (map) => {
        this.map = new Map(map.entries());

        this.socket.on("pixel change", ({ pixelIndex, color }) => {
          this.map.set(pixelIndex, color);
        });

        resolve();
      });
    });
  };

  public addPixelChangeHandler = (handler: OnReceiveFunctionHandler<"pixel change">): void => {
    this.socket.on("pixel change", handler);
  };

}