import { SocketManager } from "#/manager/socket-manager";
import { ConnectedVirtualMap } from "#/manager/virtual-map";
import { createSocket } from "#/socket";
import { Position } from "#/tetris/Position";
import { env } from "#/utils/env";
import { Tetris } from "./Tetris";

void (async() => {
  const connectedMap = new ConnectedVirtualMap(createSocket().socket);

  await connectedMap.init();

  const socketManager = new SocketManager(env.SOCKET_COUNT);

  await socketManager.connectSockets();

  const assetsRoot = "./resources/assets/tetris/";
  const tetris = new Tetris(
    socketManager,
    createSocket().socket,
    connectedMap,
    {
      background: {
        texturePath: `${assetsRoot}board.png`
      },
      controlls: {
        left: {
          texturePath: `${assetsRoot}left.png`,
          offset: new Position(17, 13)
        },
        right: {
          texturePath: `${assetsRoot}right.png`,
          offset: new Position(17, 21)
        },
        rotate: {
          texturePath: `${assetsRoot}rotate.png`,
          offset: new Position(17, 17)
        },
        down: {
          texturePath: `${assetsRoot}down.png`,
          offset: new Position(21, 17)
        }
      },
      blockPreview: {
        texturePath: `${assetsRoot}block_preview.png`,
        offset: new Position(1, 3),
        block: {
          offset: new Position(1, 1)
        }
      },
      grid: {
        texturePath: `${assetsRoot}grid.png`,
        offset: new Position(4, 1)
      }
    }
  );

})();