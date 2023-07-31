import { isDevEnv } from "#/index";
import type { ClientToServerEvents, ServerToClientEvents } from "#/socket/type";
import { io, type Socket } from "socket.io-client";

type SocketInfo = {socket: Socket<ServerToClientEvents, ClientToServerEvents>; isAvailable: boolean}

export class SocketManager {

  readonly WS_URL = isDevEnv ? "http://localhost:3044" : "https://beginjavascript-module-dom-production.up.railway.app";

  readonly HEADER = {
    "origin": "https://rplacejs.vercel.app",
    "user-agent": "baited"
  };

  private socketCount: number;

  private sockets: Record<string, SocketInfo> = {};

  constructor(socketCount: number) {
    this.socketCount = socketCount;
  }

  public connectSockets = (): Promise<void> => {
    const randomId = (length = 6): string => {
      return Math.random().toString(36).substring(2, length + 2);
    };

    return new Promise((resolve) => {
      let connectedSockets = 0;

      for (let index = 0; index < this.socketCount; index++) {
        const IP = randomId();
        const socket = io(this.WS_URL, {
          transports: ["websocket"],
          extraHeaders: { ...this.HEADER, "x-forwarded-for": IP }
        });
        this.sockets[IP] = { socket, isAvailable: true };

        socket.on("connected", () => {
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
            socketInfo.isAvailable = false; // Marquer le socket comme utilisé
            resolve(IP);
            return;
          }
        }
        // Aucun socket disponible, attendre un bref délai et vérifier à nouveau
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