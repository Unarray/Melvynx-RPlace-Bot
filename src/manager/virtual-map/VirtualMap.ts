import type { OnReceiveFunctionHandler, PixelChange, Socket } from "#/socket";
import { createSocket } from "#/socket";

export class VirtualMap {

  public static readonly HEIGHT = 25;

  public static readonly WIDTH = 25;

  public static readonly ALLOWED_COLORS = {
    RED: "#ff4500", // Red
    GREEN: "#00cc78", // Green
    BLUE: "#2450a5", // Blue
    PURPLE: "#821f9f", // Purple
    YELLOW: "#fed734", // Yellow
    WHITE: "#f9fafc", // White
    BLACK: "#000000" // Black
  };

  public map: string[] = [];

  public targetedMap: Map<number, string>;

  private lastDifferentPixelIndex = -1;

  private socket!: Socket;

  constructor(targetedMap: Map<number, string>) {
    this.targetedMap = targetedMap;
  }

  public init = (): Promise<void> => {
    return new Promise((resolve) => {
      this.socket = createSocket().socket;

      this.socket.on("init", (map) => {
        this.map = map;
        this.socket.on("pixel change", ({ pixelIndex, color }) => {
          this.map[pixelIndex] = color;
        });

        resolve();
      });
    });
  };

  public getPixelColor = (index: number): string => {
    return this.map[index];
  };

  public getTargetedPixelColor = (index: number): string => {
    const color = this.targetedMap.get(index);

    if (!color) {
      throw new Error("Index out of range");
    }

    return color;
  };

  public isValidPixel = (index: number): boolean => {
    const targetedColor = this.targetedMap.get(index);

    if (!targetedColor) return true;

    return this.map[index] === targetedColor;
  };

  public setPixelColor = (index: number, color: string): void => {
    this.map[index] = color;
  };

  public getNextDifferentPixel = (): PixelChange | null => {
    for (const [index, color] of this.targetedMap) {
      if (index == this.lastDifferentPixelIndex) continue;
      if (this.getPixelColor(index) === color) continue;

      this.lastDifferentPixelIndex = index;

      return {
        pixelIndex: index,
        color
      };
    }

    return null;
  };

  public addPixelChangeHandler = (handler: OnReceiveFunctionHandler<"pixel change">): void => {
    this.socket.on("pixel change", handler);
  };

}