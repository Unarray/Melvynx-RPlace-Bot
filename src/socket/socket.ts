import { SOCKET_HEADER, WEBSOCKET_URL } from "./socket.const";
import { io } from "socket.io-client";
import { randomIP } from "#/utils/random";
import type { SocketData } from "./socket.type";

export const createSocket = (): SocketData => {
  const IP = `BAITED-${randomIP()}`;

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