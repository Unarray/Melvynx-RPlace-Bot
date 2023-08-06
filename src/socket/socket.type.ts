import type { CanBePromise } from "#/utils";
import type { Socket as IOSocket } from "socket.io-client";

export interface ServerToClientEvents {
  "connected": (connected: { live: number }) => CanBePromise<void>;
  "init": (init: string[]) => CanBePromise<void>;
  "pong": (pong: Pong) => CanBePromise<void>;
  "pixel change": (pixelChange: PixelChange) => CanBePromise<void>;
  "disconnected": () => CanBePromise<void>;
  "message": (data: { message: string }) => CanBePromise<void>;
}

export interface ClientToServerEvents {
  "pixel change": (pixelChange: PixelChange) => CanBePromise<void>;
  "message": (data: { message: string }) => CanBePromise<void>;
}


export type Pong = { success: boolean; message: string; date: Date }

export type PixelChange = { pixelIndex:number; color:string }

export type Socket = IOSocket<ServerToClientEvents, ClientToServerEvents>

export type SocketData = {
  socket: Socket;
  IP: string;
}

export type OnReceiveFunctionHandler<T extends keyof ServerToClientEvents> = (
  ...args: Parameters<ServerToClientEvents[T]>
) => CanBePromise<void>;