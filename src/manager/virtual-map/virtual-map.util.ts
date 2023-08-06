import { VirtualMap } from "#/manager/virtual-map/VirtualMap";
import { getMostIdentical, hexToRgb, isHexColor, type RGB } from "#/utils/color";

export const rgbMatrixToVirtualMap = (matrix: RGB[][]): Map<number, string> => {
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

      virtalMap.set(x + 25 * y, `#${colorToHex(pixel.red)}${colorToHex(pixel.green)}${colorToHex(pixel.blue)}`.toLowerCase());
      x++;
    }

    x = 0;
    y++;
  }

  return virtalMap;
};