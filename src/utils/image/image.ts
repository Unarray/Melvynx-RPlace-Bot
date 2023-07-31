import type { RGB } from "#/utils/color";
import type Jimp from "jimp";

export const scanToRgbaMatrix = (jimpImage: Jimp): RGB[][] => {
  const rgbMatrix: RGB[][] = [];

  jimpImage.scan(
    0,
    0,
    jimpImage.bitmap.width,
    jimpImage.bitmap.height,
    (x: number, y: number, idx: number): void => {
      const red   = jimpImage.bitmap.data[idx + 0];
      const green = jimpImage.bitmap.data[idx + 1];
      const blue  = jimpImage.bitmap.data[idx + 2];
      const alpha = jimpImage.bitmap.data[idx + 3];

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