import { SocketManager } from "#/manager/socket-manager/SocketManager";
import { VirtualMap, rgbMatrixToVirtualMap } from "#/manager/virtual-map";
import { imageToRGB, loadResizedImage } from "#/utils/image";


void (async() => {
  const imagePath = "./full_mario.png";
  const image = await loadResizedImage(process.argv.includes("reset") ? "./reset.png" : imagePath, VirtualMap.WIDTH, VirtualMap.HEIGHT);

  const virutalTargetMap = rgbMatrixToVirtualMap(imageToRGB(image));
  const virtalMap = new VirtualMap(virutalTargetMap);

  await virtalMap.init();

  const socketManager = new SocketManager(100);

  await socketManager.connectSockets();

  console.log("CONNECTED !");

  virtalMap.addPixelChangeHandler(async(pixelChange) => {
    const { pixelIndex } = pixelChange;

    if (virtalMap.isValidPixel(pixelIndex)) return;

    const targetedColor = virtalMap.getTargetedPixelColor(pixelIndex);
    const socketID = await socketManager.getNextAvailableSocket();

    virtalMap.setPixelColor(pixelIndex, targetedColor);
    void socketManager.placePixel(socketID, pixelIndex, targetedColor);
  });

  let pixel = virtalMap.getNextDifferentPixel();

  while (pixel) {
    const socketID = await socketManager.getNextAvailableSocket();

    virtalMap.setPixelColor(pixel.pixelIndex, pixel.color);
    void socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);

    pixel = virtalMap.getNextDifferentPixel();
  }
})();