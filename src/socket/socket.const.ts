import { isDevEnv } from "#/env";

export const SOCKET_HEADER = {
  "origin": "https://rplacejs.vercel.app",
  "user-agent": "baited"
};

export const WEBSOCKET_URL = isDevEnv ? "http://localhost:3044" : "https://beginjavascript-module-dom-production.up.railway.app";