import type { Block } from "#/manager/tetris";
import { Position, type GameGrid } from "#/manager/tetris";
import { VirtualMap } from "#/manager/virtual-map";

const HIDDEN_TOP_ROWS = 2;

export const gameGridToVirtualMap = (grid: GameGrid, offset = new Position(0, 0)): Map<number, string> => {
  const virtualMap = new Map<number, string>();

  for (const [row, values] of grid.grid.entries()) {
    if (row < HIDDEN_TOP_ROWS) continue;

    for (const [column, color] of values.entries()) {
      virtualMap.set(
        (row - HIDDEN_TOP_ROWS + offset.row) * VirtualMap.HEIGHT + column + offset.column,
        color
      );
    }
  }

  return virtualMap;
};

export const addBlockToVirtualGameGrid = (grid: Map<number, string>, block: Block, gridOffset = new Position(0, 0)): Map<number, string> => {
  const virtualMap = new Map(grid);

  for (const position of block.getTilePositions()) {
    if (position.row < HIDDEN_TOP_ROWS) continue;

    virtualMap.set((position.row - HIDDEN_TOP_ROWS + gridOffset.row) * VirtualMap.HEIGHT + position.column + gridOffset.column, block.getColor());
  }

  return virtualMap;
};

export const addBlockToVirtualBlockPreview = (
  blockPreview: Map<number, string>,
  block: Block,
  blockOffset = new Position(0, 0)
): Map<number, string> => {
  const virtualMap = new Map(blockPreview);

  for (const position of block.getTilePositions()) {
    virtualMap.set((position.row + blockOffset.row) * VirtualMap.HEIGHT + position.column + blockOffset.column, block.getColor());
  }

  return virtualMap;
};