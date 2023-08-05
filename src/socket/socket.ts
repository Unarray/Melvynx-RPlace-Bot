import { SOCKET_HEADER, WEBSOCKET_URL } from "./socket.const";
import { io } from "socket.io-client";
import { randomID } from "#/utils/random";
import type { SocketData } from "./socket.type";

export const createSocket = (): SocketData => {
  const IP = randomID();

  return {
    socket: io(
      WEBSOCKET_URL,
      {
        transports: ["websocket"],
        extraHeaders: { ...SOCKET_HEADER, "x-forwarded-for": IP }
      }
    ),
    IP
  };
};