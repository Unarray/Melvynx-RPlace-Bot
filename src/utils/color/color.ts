import type { RGB, HexColor } from "./color.type";

export const difference = (color1: RGB, color2: RGB): number => {
  const sqr = Math.sqrt;
  const pow = (v: number): number => Math.pow(v, 2);

  return sqr(pow(color1.red - color2.red) + pow(color1.green - color2.green) + pow(color1.blue - color2.blue));
};

export const getMostIdentical = (origin: RGB, colors: RGB[]): RGB => {
  let mostIdentical = colors[0];
  let mostIdenticalDifference = difference(origin, mostIdentical);

  for (const color of colors) {
    const differenceValue = difference(origin, color);

    if (differenceValue >= mostIdenticalDifference) continue;

    mostIdentical = color;
    mostIdenticalDifference = differenceValue;
  }

  return mostIdentical;
};

export const isRGBValues = (color: RGB): boolean => {
  return isInRGBRange(color.red) && isInRGBRange(color.green) && isInRGBRange(color.blue);
};

export const isInRGBRange = (value: number): boolean => Number.isInteger(value) && value >= 0 && value <= 255;

export const isHexColor = (value: string): value is HexColor => (/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i).test(value);

export const hexToRgb = (hex: HexColor): RGB => {
  let code = hex.replace("#", "");

  if (code.length === 3) code = code.split("").map(value => `${value}${value}`).join("");

  const red = code.slice(0, 2);
  const green = code.slice(2, 4);
  const blue = code.slice(4, 6);

  return {
    red: parseInt(red, 16),
    green: parseInt(green, 16),
    blue: parseInt(blue, 16)
  };
};