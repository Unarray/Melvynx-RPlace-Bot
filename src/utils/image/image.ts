import Jimp from "jimp";

export const loadResizedImage = async(path: string, width: number, height: number): Promise<Jimp> => {
  const image =  await Jimp.read(path);

  return  image.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR);
};