import type { SocketManager } from "#/manager/socket-manager";
import type { ConnectedVirtualMap } from "#/manager/virtual-map";
import { TargetVirtualMap, VirtualMap } from "#/manager/virtual-map";
import type { OnReceiveFunctionHandler, Socket } from "#/socket";
import Jimp from "jimp";
import type { TetrisConfig } from "./type";
import { imageToRGB } from "#/utils/image";
import type { Position } from "./Position";
import { GameState } from "./GameState";
import { logger } from "#/utils/logger";
import { MessageManager } from "#/manager/message-manager";

export class Tetris {

  public static readonly TICK_SPEED = 1000;

  private static sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

  private static pixelsPositionWithOffset = (offset: Position, map: Map<number, string>): Map<number, string> => {
    const offsetMap = new Map<number, string>();

    for (const [i, color] of map) {
      offsetMap.set(
        i + offset.row * VirtualMap.HEIGHT + offset.column,
        color
      );
    }

    return offsetMap;
  };

  public canRestart = true;

  private config: TetrisConfig;

  private socketManager: SocketManager;

  private messageManager!: MessageManager;

  private gameState: GameState;

  private maxScore = 0;

  private backgroundMap!: TargetVirtualMap;

  private controllMaps!: {
    left: TargetVirtualMap;
    right: TargetVirtualMap;
    rotate: TargetVirtualMap;
    down: TargetVirtualMap;
  };

  private blockPreviewMap!: TargetVirtualMap;

  private gridMap!: TargetVirtualMap;

  private hiddenRows!: number;


  constructor(socketManager: SocketManager, messageSocket: Socket, connectedMap: ConnectedVirtualMap, config: TetrisConfig) {
    this.config = config;
    this.socketManager = socketManager;
    this.messageManager = new MessageManager(messageSocket, "👾 Tetris Game - ");
    this.gameState = new GameState();

    void (async() => {
      // Create background VirtualMap
      logger.info("Create `background` VirtualMap...");
      const backgroundTexture = await Jimp.read(config.background.texturePath);
      this.backgroundMap = new TargetVirtualMap(connectedMap, VirtualMap.rgbMatrixToVirtualMap(imageToRGB(backgroundTexture)));
      logger.success("Bacground VirtualMap loaded");

      // Create controlls VirtualMaps
      logger.info("Create `controlls` VirtualMaps...");
      const controllLeftTexture = await Jimp.read(config.controlls.left.texturePath);
      const controllRightTexture = await Jimp.read(config.controlls.right.texturePath);
      const controllRotateTexture = await Jimp.read(config.controlls.rotate.texturePath);
      const controllDownTexture = await Jimp.read(config.controlls.down.texturePath);
      this.controllMaps = {
        left: new TargetVirtualMap(
          connectedMap,
          Tetris.pixelsPositionWithOffset(
            config.controlls.left.offset,
            VirtualMap.rgbMatrixToVirtualMap(imageToRGB(controllLeftTexture))
          )
        ),
        right: new TargetVirtualMap(
          connectedMap,
          Tetris.pixelsPositionWithOffset(
            config.controlls.right.offset,
            VirtualMap.rgbMatrixToVirtualMap(imageToRGB(controllRightTexture))
          )
        ),
        rotate: new TargetVirtualMap(
          connectedMap,
          Tetris.pixelsPositionWithOffset(
            config.controlls.rotate.offset,
            VirtualMap.rgbMatrixToVirtualMap(imageToRGB(controllRotateTexture))
          )
        ),
        down: new TargetVirtualMap(
          connectedMap,
          Tetris.pixelsPositionWithOffset(
            config.controlls.down.offset,
            VirtualMap.rgbMatrixToVirtualMap(imageToRGB(controllDownTexture))
          )
        )
      };
      logger.success("Controlls VirtualMaps loaded");

      // Create blockPreviewMap VirtualMap
      logger.info("Create `blockPreviewMap` VirtualMap...");
      const blockPreviewTexture = await Jimp.read(config.blockPreview.texturePath);
      this.blockPreviewMap = new TargetVirtualMap(
        connectedMap,
        Tetris.pixelsPositionWithOffset(
          config.blockPreview.offset,
          VirtualMap.rgbMatrixToVirtualMap(imageToRGB(blockPreviewTexture))
        )
      );
      logger.success("Block Preview VirtualMap loaded");

      // Create grid VirtualMap
      logger.info("Create `grid` VirtualMap...");
      const gridTexture = await Jimp.read(config.grid.texturePath);
      const gridTextureRGB = imageToRGB(gridTexture);
      this.hiddenRows = GameState.ROWS < gridTextureRGB.length ? 0 : GameState.ROWS - gridTextureRGB.length;
      this.gridMap = new TargetVirtualMap(
        connectedMap,
        Tetris.pixelsPositionWithOffset(
          config.grid.offset,
          VirtualMap.rgbMatrixToVirtualMap(gridTextureRGB)
        )
      );
      logger.success("Grid VirtualMap loaded");

      // Define all default handlers
      this.backgroundMap.getConnectedMap().addPixelChangeHandler(this.defaultPixelChangeHandler(this.backgroundMap));
      this.controllMaps.left.getConnectedMap().addPixelChangeHandler(this.defaultPixelChangeHandler(this.controllMaps.left));
      this.controllMaps.right.getConnectedMap().addPixelChangeHandler(this.defaultPixelChangeHandler(this.controllMaps.right));
      this.controllMaps.rotate.getConnectedMap().addPixelChangeHandler(this.defaultPixelChangeHandler(this.controllMaps.rotate));
      this.controllMaps.down.getConnectedMap().addPixelChangeHandler(this.defaultPixelChangeHandler(this.controllMaps.down));
      this.blockPreviewMap.getConnectedMap().addPixelChangeHandler(this.defaultPixelChangeHandler(this.blockPreviewMap));
      this.gridMap.getConnectedMap().addPixelChangeHandler(this.defaultPixelChangeHandler(this.gridMap));
      logger.success("Default pixel change handlers loaded");

      logger.info("Drawing of `background`...");
      await this.drawVirtualMap(this.backgroundMap);
      logger.success("`background` drawn!");

      logger.info("Drawing of `controlls`...");
      await this.drawVirtualMap(this.controllMaps.left);
      await this.drawVirtualMap(this.controllMaps.right);
      await this.drawVirtualMap(this.controllMaps.rotate);
      await this.drawVirtualMap(this.controllMaps.down);
      logger.success("`controlls` drawn!");

      logger.info("Drawing of `block preview`...");
      await this.drawVirtualMap(this.blockPreviewMap);
      logger.success("`block preview` drawn!");

      logger.info("Drawing of `grid`...");
      await this.drawVirtualMap(this.gridMap);
      logger.success("`grid` drawn!");

      logger.info("Adding Tetris blocks controll...");
      this.controllMaps.left.getConnectedMap().addPixelChangeHandler(({ pixelIndex }) => {
        if (this.controllMaps.left.isValidPixel(pixelIndex)) return;
        if (this.gameState.moveBlockLeft()) {
          this.updateGridMap(true);
          void this.drawVirtualMap(this.gridMap);
        }
      });
      this.controllMaps.right.getConnectedMap().addPixelChangeHandler(({ pixelIndex }) => {
        if (this.controllMaps.right.isValidPixel(pixelIndex)) return;
        if (this.gameState.moveBlockRight()) {
          this.updateGridMap(true);
          void this.drawVirtualMap(this.gridMap);
        }
      });
      this.controllMaps.rotate.getConnectedMap().addPixelChangeHandler(({ pixelIndex }) => {
        if (this.controllMaps.rotate.isValidPixel(pixelIndex)) return;
        if (this.gameState.rotateBlock()) {
          this.updateGridMap(true);
          void this.drawVirtualMap(this.gridMap);
        }
      });
      this.controllMaps.down.getConnectedMap().addPixelChangeHandler(({ pixelIndex }) => {
        if (this.controllMaps.down.isValidPixel(pixelIndex)) return;
        if (this.gameState.moveBlockDown()) {
          this.updateGridMap(true);
          void this.drawVirtualMap(this.gridMap);
        }
      });
      logger.success("Tetris blocks controll have been added!");


      logger.info("Adding Tetris chat commands...");
      this.messageManager.addMessageHandler(({ message }) => {
        if (message.startsWith(this.messageManager.getPrefix())) return;
        if (!message.endsWith("!score")) return;

        this.messageManager.sendMessage(`Score: ${this.gameState.getScore()}`);
      });
      this.messageManager.addMessageHandler(({ message }) => {
        if (message.startsWith(this.messageManager.getPrefix())) return;
        if (!message.endsWith("!max-score")) return;

        this.messageManager.sendMessage(`Max Score: ${this.maxScore}`);
      });
      logger.success("Tetris chat commands have been added!");

      void this.tickProcessor();
      logger.success("Tetris Game has been launched!");

    })();
  }

  // Update the VirtualMap grid with current game state
  private updateGridMap = (drawnCurrentBlock = false): void => {
    const offset = this.config.grid.offset;

    for (const [row, values] of this.gameState.getGameGrid().grid.entries()) {
      if (row < this.hiddenRows) continue;

      for (const [column, color] of values.entries()) {
        this.gridMap.setPixelColor(
          (row - this.hiddenRows + offset.row) * VirtualMap.HEIGHT + column + offset.column,
          color
        );
      }
    }

    if (drawnCurrentBlock) {
      const block = this.gameState.getCurrentBlock();

      for (const position of block.getTilePositions()) {
        if (position.row < this.hiddenRows) continue;

        this.gridMap.setPixelColor(
          (position.row - this.hiddenRows + offset.row) * VirtualMap.HEIGHT + position.column + offset.column,
          block.getColor()
        );
      }
    }
  };

  // Update the VirtualMap blockPreview with current game state
  private updateBlockPreviewMap = (): void => {
    this.blockPreviewMap.fillMap(VirtualMap.ALLOWED_COLORS.WHITE);
    const block = this.gameState.getNextBlock();
    const blockOffset = this.config.blockPreview.block.offset;

    for (const position of block.getTilePositions()) {
      this.blockPreviewMap.setPixelColor(
        // (position.row + offset.row + blockOffset.row) * VirtualMap.HEIGHT + position.column + offset.column + blockOffset.column,
        (position.row +  blockOffset.row) * VirtualMap.HEIGHT + position.column +  blockOffset.column,
        block.getColor()
      );
    }
  };

  // Draw a virtual map on r/placejs
  private drawVirtualMap = async(map: TargetVirtualMap): Promise<void> => {
    let pixel = map.getNextDifferentPixel();

    while (pixel) {
      const socketID = await this.socketManager.getNextAvailableSocket();

      map.getConnectedMap().setPixelColor(pixel.pixelIndex, pixel.color);
      void this.socketManager.placePixel(socketID, pixel.pixelIndex, pixel.color);

      pixel = map.getNextDifferentPixel();
    }
  };

  private defaultPixelChangeHandler = (map: TargetVirtualMap): OnReceiveFunctionHandler<"pixel change"> => {
    return async(pixelChange) => {
      const { pixelIndex } = pixelChange;

      if (map.isValidPixel(pixelIndex)) return;

      const targetedColor = map.getTargetedPixelColor(pixelIndex);
      const socketID = await this.socketManager.getNextAvailableSocket();

      map.getConnectedMap().setPixelColor(pixelIndex, targetedColor);
      void this.socketManager.placePixel(socketID, pixelIndex, targetedColor);
    };
  };


  private tickProcessor = async(): Promise<void> => {
    while (this.canRestart) {
      logger.info("Game start");
      this.messageManager.sendMessage("New game launched!");

      while (!this.gameState.getGameOver()) {
        await Tetris.sleep(Tetris.TICK_SPEED);
        await this.tick();
      }

      logger.info("Game loose");

      this.messageManager.sendMessage(`GameOver! Your score: ${this.gameState.getScore()} | Max Score: ${this.maxScore}`);

      if (this.canRestart) {
        logger.info("Restart timer launched");
        await Tetris.sleep(1000);

        for (let i = 3; i > 0; i--) {
          this.messageManager.sendMessage(`Restart in: ${i}`);
          await Tetris.sleep(1000);
        }

        this.gameState = new GameState();
      }
    }
  };

  private tick = async(): Promise<void> => {
    this.gameState.moveBlockDown();

    // Update max score
    if (this.maxScore < this.gameState.getScore()) {
      this.maxScore = this.gameState.getScore();
    }

    // Update grid & blockPreview VirtualMaps with current game state
    this.updateGridMap(true);
    await this.drawVirtualMap(this.gridMap);

    this.updateBlockPreviewMap();
    await this.drawVirtualMap(this.blockPreviewMap);
  };


}