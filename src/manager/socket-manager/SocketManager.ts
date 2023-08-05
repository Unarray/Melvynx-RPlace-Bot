import type { SocketInfo } from "./socket-manager.type";
import { createSocket } from "#/socket";

export class SocketManager {

  private socketCount: number;

  private sockets: Record<string, SocketInfo> = {};

  constructor(socketCount: number) {
    this.socketCount = socketCount;
  }

  public connectSockets = (): Promise<void> => {
    return new Promise((resolve) => {
      let connectedSockets = 0;

      for (let index = 0; index < this.socketCount; index++) {
        const socketData = createSocket();
        this.sockets[socketData.IP] = { socket: socketData.socket, isAvailable: true };

        socketData.socket.on("connected", () => {
          connectedSockets++;
          if (connectedSockets === this.socketCount) resolve();
        });
      }
    });
  };

  public getNextAvailableSocket = (): Promise<string> => {
    return new Promise((resolve) => {
      const checkAvailability = (): void => {
        for (const IP in this.sockets) {
          const socketInfo = this.sockets[IP];
          if (socketInfo.isAvailable) {
            socketInfo.isAvailable = false;

            resolve(IP);
            return;
          }
        }

        setTimeout(checkAvailability, 100);
      };

      checkAvailability(); // Démarrer la vérification de la disponibilité
    });
  };

  public placePixel = (socketID: string, position: number, color: string): Promise<void> => {
    return new Promise((resolve) => {
      const socketInfo = this.sockets[socketID];
      this.sockets[socketID].isAvailable = false;

      socketInfo.socket.emit("pixel change", {
        pixelIndex: position,
        color: color
      });

      socketInfo.socket.on("pong", () => {
        resolve();

        setTimeout(() => {
          this.sockets[socketID].isAvailable = true;
        }, 2600);
      });
    });
  };

}