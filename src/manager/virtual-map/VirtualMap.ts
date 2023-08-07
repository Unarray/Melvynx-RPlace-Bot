import type { RGB } from "#/utils/color";
import { getMostIdentical, hexToRgb, isHexColor } from "#/utils/color";

export abstract class VirtualMap {

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

  protected map = new Map<number, string>();

  public static isIndexInRange = (index: number): boolean => {
    return index >= 0 && index < VirtualMap.HEIGHT * VirtualMap.WIDTH;
  };

  public getPixelColor = (index: number): string | undefined => {
    if (!VirtualMap.isIndexInRange(index)) throw new Error("Pixel isn't in VirtualMap range");

    return this.map.get(index);
  };


  public setPixelColor = (index: number, color: string): void => {
    if (!VirtualMap.isIndexInRange(index)) throw new Error("Pixel isn't in VirtualMap range");

    this.map.set(index, color);
  };

  // ----------------- //
  //  STATICS METHODS  //
  // ----------------- //

  public static rgbMatrixToVirtualMap = (matrix: RGB[][]): Map<number, string> => {
    const virtalMap: Map<number, string> = new Map();

    const allowRDGColors = Object.values(VirtualMap.ALLOWED_COLORS).map(v => {
      if (isHexColor(v)) {
        return hexToRgb(v);
      }

      return {
        red: -1,
        green: -1,
        blue: -1
      };
    });

    let y = 0;

    for (const row of matrix) {
      let x = 0;

      for (let pixel of row) {
        if (pixel.red === -1) {
          x++;
          continue;
        }

        const colorToHex = (color: number): string => {
          const hexadecimal = color.toString(16);

          return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
        };

        pixel = getMostIdentical(pixel, [...allowRDGColors]);

        virtalMap.set(x + VirtualMap.HEIGHT * y, `#${colorToHex(pixel.red)}${colorToHex(pixel.green)}${colorToHex(pixel.blue)}`.toLowerCase());
        x++;
      }

      x = 0;
      y++;
    }

    return virtalMap;
  };

}