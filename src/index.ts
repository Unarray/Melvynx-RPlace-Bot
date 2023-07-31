import Jimp from "jimp";
import { scanToRgbaMatrix } from "#/utils/image/image";
import type { RGB } from "#/utils/color";
import { getMostIdentical, hexToRgb, isHexColor } from "#/utils/color";
import { SocketManager } from "#/manager/SocketManager";

export const isDevEnv = process.argv.includes("dev");

// const wsUrl = "https://beginjavascript-module-dom-production.up.railway.app";

// const header = {
//   "origin": "https://rplacejs.vercel.app",
//   "user-agent": "baited"
// };

// const MAX = 624;
const ALLOWED_COLORS = [
  "#ff4500",
  "#00cc78",
  "#2450a5",
  "#821f9f",
  "#fed734",
  "#f9fafc",
  "#000000"
];

// const randomId = (length = 6): string => {
//   return Math.random().toString(36).substring(2, length + 2);
// };

void (async() => {
  const image =  await Jimp.read("./hahaha.png");
  const matrix = scanToRgbaMatrix(image);

  const ALLOWED_COLORS_RGB: RGB[] = ALLOWED_COLORS.map(v => {
    if (isHexColor(v)) {
      return hexToRgb(v);
    }
    return {
      red: -1,
      green: -1,
      blue: -1
    };
  });

  const pixelsToPlace: {pixelIndex: number; color: string}[] = [];

  let y = 0;
  for (const row of matrix) {
    let x = 0;
    for (let pixel of row) {
      if (pixel.red === -1) {
        // pixelsToPlace[x + 25 * y] = "#821f9f";
        x++;
        continue;
      }
      const colorToHex = (color: number): string => {
        const hexadecimal = color.toString(16);
        return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
      };

      pixel = getMostIdentical(pixel, [...ALLOWED_COLORS_RGB]);

      pixelsToPlace.push({
        pixelIndex: x + 25 * y,
        color: `#${colorToHex(pixel.red)}${colorToHex(pixel.green)}${colorToHex(pixel.blue)}`.toLowerCase()
      });
      x++;
    }
    x = 0;
    y++;
  }

  const socketCount = pixelsToPlace.length > 125 ? 125 : pixelsToPlace.length;

  const socketManager = new SocketManager(socketCount);
  await socketManager.connectSockets();
  console.log("CONNECTED !");

  // const MAX_INDEX = 624;

  for (const pixel of pixelsToPlace) {
    const socketID = await socketManager.getNextAvailableSocket();
    void socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);
  }


  // for (let i = 0; i < MAX_INDEX + 1; i++) {
  //   const socketID = await socketManager.getNextAvailableSocket();
  //   void socketManager.placePixel(socketID, i, "#f9fafc");
  // }
  // while (true) {
  //   index++;
  //   index = index % (MAX_INDEX + 1);
  //   console.log("++");

  // }

})();