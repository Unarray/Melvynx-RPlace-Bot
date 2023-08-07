import { VirtualMap } from "./VirtualMap";
import type { PixelChange } from "#/socket";
import type { ConnectedVirtualMap } from "./ConnectedVirtualMap";

export class TargetVirtualMap extends VirtualMap {

  private connectedMap: ConnectedVirtualMap;

  private lastDifferentPixelIndex = -1;


  constructor(connectedMap: ConnectedVirtualMap, map = new Map<number, string>()) {
    super();
    this.map = map;
    this.connectedMap = connectedMap;
  }

  public getConnectedMap = (): ConnectedVirtualMap => {
    return this.connectedMap;
  };

  public fillMap = (color: typeof VirtualMap.ALLOWED_COLORS[keyof typeof VirtualMap.ALLOWED_COLORS]): void => {
    for (const [index, _] of this.map) {
      this.map.set(index, color);
    }
  };

  public getTargetedPixelColor = (index: number): string => {
    const color = this.map.get(index);

    if (!color) {
      throw new Error("Index out of range");
    }

    return color;
  };

  public isValidPixel = (index: number): boolean => {
    const color = this.map.get(index);

    if (!color) return true;

    return this.connectedMap.getPixelColor(index) === color;
  };

  public getNextDifferentPixel = (): PixelChange | null => {
    for (const [index, color] of this.map) {
      if (index == this.lastDifferentPixelIndex) continue;
      if (this.connectedMap.getPixelColor(index) === color) continue;

      this.lastDifferentPixelIndex = index;

      return {
        pixelIndex: index,
        color
      };
    }

    return null;
  };

}