import { addBlockToVirtualBlockPreview, addBlockToVirtualGameGrid, gameGridToVirtualMap } from "#/index.tetris.utils";
import { SocketManager } from "#/manager/socket-manager";
import { GameManager, Position } from "#/manager/tetris";
import { VirtualMap, rgbMatrixToVirtualMap } from "#/manager/virtual-map";
import { createSocket } from "#/socket";
import { imageToRGB } from "#/utils/image";
import Jimp from "jimp";

void (async() => {
  const gameManager = new GameManager();

  // Initialize game grid
  const gridOffset = new Position(4, 1);
  const gridVirtualMap = new VirtualMap(gameGridToVirtualMap(gameManager.getGameGrid(), gridOffset));

  const getIndex = (pos: Position, offset: Position, height: number): number => {
    return (pos.row + offset.row) * height + pos.column + offset.column;
  };

  // Initialize controlls
  const controllsTexture = await Jimp.read("./resources/assets/tetris/controlls.png");
  const controllsOffset = new Position(17, 13);
  const controllLeftIndex = getIndex(new Position(1, 1), controllsOffset, VirtualMap.HEIGHT);
  const controllRightIndex = getIndex(new Position(1, 9), controllsOffset, VirtualMap.HEIGHT);
  const controllRotateIndex = getIndex(new Position(1, 5), controllsOffset, VirtualMap.HEIGHT);
  const controllDownIndex = getIndex(new Position(5, 5), controllsOffset, VirtualMap.HEIGHT);
  const controllsVirtualMap = new VirtualMap(new Map<number, string>());

  for (const [i, color] of rgbMatrixToVirtualMap(imageToRGB(controllsTexture))) {
    controllsVirtualMap.targetedMap.set(
      i + controllsOffset.row * VirtualMap.HEIGHT + controllsOffset.column,
      color
    );
  }

  // Initialize block preview
  const blockPreviewTexture = await Jimp.read("./resources/assets/tetris/block_preview.png");
  const blockPreviewOffset = new Position(0, 3);
  const blockPreviewBlockOffset = new Position(0, 1);
  const blockPreviewEmptyVirtualMap = new Map<number, string>();

  for (const [i, color] of rgbMatrixToVirtualMap(imageToRGB(blockPreviewTexture))) {
    blockPreviewEmptyVirtualMap.set(
      i + blockPreviewOffset.row * VirtualMap.HEIGHT + blockPreviewOffset.column,
      color
    );
  }

  const blockPreviewVirtualMap = new VirtualMap(blockPreviewEmptyVirtualMap);


  // Initialize game board
  const boardTexture = await Jimp.read("./resources/assets/tetris/board.png");
  const boardVirtualMap = new VirtualMap(new Map<number, string>());

  for (const [i, color] of rgbMatrixToVirtualMap(imageToRGB(boardTexture))) {
    boardVirtualMap.targetedMap.set(i, color);
  }

  // Initialize sockets for each board modules (board, controlls, block preview, grid)
  await boardVirtualMap.init();
  await controllsVirtualMap.init();
  await blockPreviewVirtualMap.init();
  await gridVirtualMap.init();

  const socketManager = new SocketManager(50);

  const messageSocket = createSocket().socket;

  await socketManager.connectSockets();

  console.log("CONNECTED !");

  // When board pixel is change
  boardVirtualMap.addPixelChangeHandler(async(pixelChange) => {
    const { pixelIndex } = pixelChange;

    if (boardVirtualMap.isValidPixel(pixelIndex)) return;

    const targetedColor = boardVirtualMap.getTargetedPixelColor(pixelIndex);
    const socketID = await socketManager.getNextAvailableSocket();

    boardVirtualMap.setPixelColor(pixelIndex, targetedColor);
    void socketManager.placePixel(socketID, pixelIndex, targetedColor);
  });

  // When controlls pixel is change
  controllsVirtualMap.addPixelChangeHandler(async(pixelChange) => {
    const { pixelIndex } = pixelChange;

    if (controllsVirtualMap.isValidPixel(pixelIndex)) return;
    let hasBeenMoved = false;
    switch (pixelIndex) {
      case controllLeftIndex:
        gameManager.moveBlockLeft();
        hasBeenMoved = true;
        break;
      case controllRightIndex:
        gameManager.moveBlockRight();
        hasBeenMoved = true;

        break;
      case controllRotateIndex:
        gameManager.rotateBlock();
        hasBeenMoved = true;

        break;
      case controllDownIndex:
        gameManager.moveBlockDown();
        hasBeenMoved = true;

        break;
    }

    if (hasBeenMoved) {
      gridVirtualMap.targetedMap = addBlockToVirtualGameGrid(
        gameGridToVirtualMap(gameManager.getGameGrid(), gridOffset),
        gameManager.getCurrentBlock(),
        gridOffset
      );

      let pixel = gridVirtualMap.getNextDifferentPixel();

      while (pixel) {
        const socketID = await socketManager.getNextAvailableSocket();

        gridVirtualMap.setPixelColor(pixel.pixelIndex, pixel.color);
        void socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);

        pixel = gridVirtualMap.getNextDifferentPixel();
      }
    }

    const targetedColor = controllsVirtualMap.getTargetedPixelColor(pixelIndex);
    const socketID = await socketManager.getNextAvailableSocket();

    controllsVirtualMap.setPixelColor(pixelIndex, targetedColor);
    void socketManager.placePixel(socketID, pixelIndex, targetedColor);
  });

  // When block preview pixel is change
  blockPreviewVirtualMap.addPixelChangeHandler(async(pixelChange) => {
    const { pixelIndex } = pixelChange;

    if (blockPreviewVirtualMap.isValidPixel(pixelIndex)) return;

    const targetedColor = blockPreviewVirtualMap.getTargetedPixelColor(pixelIndex);
    const socketID = await socketManager.getNextAvailableSocket();

    blockPreviewVirtualMap.setPixelColor(pixelIndex, targetedColor);
    void socketManager.placePixel(socketID, pixelIndex, targetedColor);
  });

  // When grid pixel is change
  gridVirtualMap.addPixelChangeHandler(async(pixelChange) => {
    const { pixelIndex } = pixelChange;

    if (gridVirtualMap.isValidPixel(pixelIndex)) return;

    const targetedColor = gridVirtualMap.getTargetedPixelColor(pixelIndex);
    const socketID = await socketManager.getNextAvailableSocket();

    gridVirtualMap.setPixelColor(pixelIndex, targetedColor);
    void socketManager.placePixel(socketID, pixelIndex, targetedColor);
  });

  // Init all pixels on RPLACE Board
  let pixel = boardVirtualMap.getNextDifferentPixel();

  while (pixel) {
    const socketID = await socketManager.getNextAvailableSocket();

    boardVirtualMap.setPixelColor(pixel.pixelIndex, pixel.color);
    void socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);

    pixel = boardVirtualMap.getNextDifferentPixel();
  }

  pixel = controllsVirtualMap.getNextDifferentPixel();

  while (pixel) {
    const socketID = await socketManager.getNextAvailableSocket();

    controllsVirtualMap.setPixelColor(pixel.pixelIndex, pixel.color);
    void socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);

    pixel = controllsVirtualMap.getNextDifferentPixel();
  }

  pixel = blockPreviewVirtualMap.getNextDifferentPixel();

  while (pixel) {
    const socketID = await socketManager.getNextAvailableSocket();

    blockPreviewVirtualMap.setPixelColor(pixel.pixelIndex, pixel.color);
    void socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);

    pixel = blockPreviewVirtualMap.getNextDifferentPixel();
  }

  pixel = gridVirtualMap.getNextDifferentPixel();

  while (pixel) {
    const socketID = await socketManager.getNextAvailableSocket();

    gridVirtualMap.setPixelColor(pixel.pixelIndex, pixel.color);
    void socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);

    pixel = gridVirtualMap.getNextDifferentPixel();
  }

  console.log("BOARD DRAW !");

  // Game tick
  void (async() => {
    gridVirtualMap.targetedMap = addBlockToVirtualGameGrid(
      gameGridToVirtualMap(gameManager.getGameGrid(), gridOffset),
      gameManager.getCurrentBlock(),
      gridOffset
    );

    const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

    let printedScore = gameManager.getScore();

    while (!gameManager.getGameOver()) {
      await sleep(1000);
      gameManager.moveBlockDown();

      if (printedScore !== gameManager.getScore()) {
        printedScore = gameManager.getScore();
        messageSocket.emit("message", {
          message: `👾 Tetris Game - Score: ${printedScore}`
        });
      }

      gridVirtualMap.targetedMap = addBlockToVirtualGameGrid(
        gameGridToVirtualMap(gameManager.getGameGrid(), gridOffset),
        gameManager.getCurrentBlock(),
        gridOffset
      );

      let pixel = gridVirtualMap.getNextDifferentPixel();

      while (pixel) {
        const socketID = await socketManager.getNextAvailableSocket();

        gridVirtualMap.setPixelColor(pixel.pixelIndex, pixel.color);
        void socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);

        pixel = gridVirtualMap.getNextDifferentPixel();
      }

      blockPreviewVirtualMap.targetedMap = addBlockToVirtualBlockPreview(
        blockPreviewEmptyVirtualMap,
        gameManager.getNextBlock(),
        blockPreviewBlockOffset
      );

      pixel = blockPreviewVirtualMap.getNextDifferentPixel();

      while (pixel) {
        const socketID = await socketManager.getNextAvailableSocket();

        blockPreviewVirtualMap.setPixelColor(pixel.pixelIndex, pixel.color);
        void socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);

        pixel = blockPreviewVirtualMap.getNextDifferentPixel();
      }
    }

    console.log("GAMEOVER");

  })();
})();