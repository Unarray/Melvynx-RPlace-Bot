export interface ServerToClientEvents {
  "connected": (connected: { live: number }) => void;
  "init": (init: string[]) => void;
  "pong": (pong: {success: boolean; message: string; date: Date }) => void;
  "pixel change": (pixelChange: { pixelIndex:number; color:string }) => void;
  "disconnected": () => void;
  "message": (message: string) => void;
}

export interface ClientToServerEvents {
  "pixel change": (pixelChange: { pixelIndex:number; color:string }) => void;
  "message": (message: string) => void;
}