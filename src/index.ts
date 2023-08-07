import { SocketManager } from "#/manager/socket-manager/SocketManager";
import { ConnectedVirtualMap, TargetVirtualMap, VirtualMap } from "#/manager/virtual-map";
import { createSocket } from "#/socket";
import { imageToRGB, loadResizedImage } from "#/utils/image";


void (async() => {
  const imagePath = "./resources/full_mario.png";
  const image = await loadResizedImage(process.argv.includes("reset") ? "./resources/reset.png" : imagePath, VirtualMap.WIDTH, VirtualMap.HEIGHT);

  const connectedMap = new ConnectedVirtualMap(createSocket().socket);

  await connectedMap.init();

  const virtualMap = new TargetVirtualMap(
    VirtualMap.rgbMatrixToVirtualMap(imageToRGB(image)),
    connectedMap
  );
  const socketManager = new SocketManager(100);

  await socketManager.connectSockets();

  console.log("CONNECTED !");

  virtualMap.getConnectedMap().addPixelChangeHandler(async(pixelChange) => {
    const { pixelIndex } = pixelChange;

    if (virtualMap.isValidPixel(pixelIndex)) return;

    const color = virtualMap.getTargetedPixelColor(pixelIndex);
    const socketID = await socketManager.getNextAvailableSocket();

    virtualMap.getConnectedMap().setPixelColor(pixelIndex, color);
    void socketManager.placePixel(socketID, pixelIndex, color);
  });

  let pixel = virtualMap.getNextDifferentPixel();

  while (pixel) {
    const socketID = await socketManager.getNextAvailableSocket();

    virtualMap.getConnectedMap().setPixelColor(pixel.pixelIndex, pixel.color);
    void socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);

    pixel = virtualMap.getNextDifferentPixel();
  }
})();