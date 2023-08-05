import type { RGB } from "#/utils/color";
import type Jimp from "jimp";

export const imageToRGB = (image: Jimp): RGB[][] => {
  const rgbMatrix: RGB[][] = [];

  image.scan(
    0,
    0,
    image.bitmap.width,
    image.bitmap.height,
    (x: number, y: number, idx: number): void => {
      const red   = image.bitmap.data[idx + 0];
      const green = image.bitmap.data[idx + 1];
      const blue  = image.bitmap.data[idx + 2];
      const alpha = image.bitmap.data[idx + 3];

      if (!rgbMatrix[y]) {
        rgbMatrix[y] = [];
      }

      if (alpha < 255) {
        rgbMatrix[y][x] = {
          red: -1,
          green: -1,
          blue: -1
        };
        return;
      }

      rgbMatrix[y][x] = {
        red,
        green,
        blue
      };
    }
  );

  return rgbMatrix;
};