import { Bag } from "#/manager/tetris/Bag";
import { Position } from "#/manager/tetris/Position";
import { VirtualMap } from "#/manager/virtual-map";
import { Block } from "./Block";
import { GameGrid } from "./GameGrid";

export class GameManager {

  private grid = new GameGrid(22, 10, VirtualMap.ALLOWED_COLORS.WHITE);

  private score = 0;

  private nextBlock: Block;

  private currentBlock: Block;

  private bag: Bag<Block>;

  private gameOver = false;

  constructor() {
    this.bag = new Bag([
      // S-Block
      new Block(
        new Position(0, 3),
        VirtualMap.ALLOWED_COLORS.BLUE,
        [
          [new Position(0, 1), new Position(0, 2), new Position(1, 0), new Position(1, 1)],
          [new Position(0, 1), new Position(1, 1), new Position(1, 2), new Position(2, 2)],
          [new Position(1, 1), new Position(1, 2), new Position(2, 0), new Position(2, 1)],
          [new Position(0, 1), new Position(1, 0), new Position(1, 1), new Position(2, 1)]
        ]
      ),
      // Z-Block
      new Block(
        new Position(0, 3),
        VirtualMap.ALLOWED_COLORS.BLUE,
        [
          [new Position(0, 0), new Position(0, 1), new Position(1, 1), new Position(1, 2)],
          [new Position(0, 2), new Position(1, 1), new Position(1, 2), new Position(2, 1)],
          [new Position(1, 0), new Position(1, 1), new Position(2, 1), new Position(2, 2)],
          [new Position(0, 1), new Position(1, 0), new Position(1, 1), new Position(2, 0)]
        ]
      ),
      // L-Block
      new Block(
        new Position(0, 3),
        VirtualMap.ALLOWED_COLORS.GREEN,
        [
          [new Position(0, 2), new Position(1, 0), new Position(1, 1), new Position(1, 2)],
          [new Position(0, 1), new Position(1, 1), new Position(2, 1), new Position(2, 2)],
          [new Position(1, 0), new Position(1, 1), new Position(1, 2), new Position(2, 0)],
          [new Position(0, 0), new Position(0, 1), new Position(1, 1), new Position(2, 1)]
        ]
      ),
      // J-Block
      new Block(
        new Position(0, 3),
        VirtualMap.ALLOWED_COLORS.GREEN,
        [
          [new Position(0, 0), new Position(1, 0), new Position(1, 1), new Position(1, 2)],
          [new Position(0, 1), new Position(0, 2), new Position(1, 1), new Position(2, 1)],
          [new Position(1, 0), new Position(1, 1), new Position(1, 2), new Position(2, 2)],
          [new Position(0, 1), new Position(1, 1), new Position(2, 1), new Position(2, 0)]
        ]
      ),
      // T-Block
      new Block(
        new Position(0, 3),
        VirtualMap.ALLOWED_COLORS.RED,
        [
          [new Position(0, 1), new Position(1, 0), new Position(1, 1), new Position(1, 2)],
          [new Position(0, 1), new Position(1, 1), new Position(1, 2), new Position(2, 1)],
          [new Position(1, 0), new Position(1, 1), new Position(1, 2), new Position(2, 1)],
          [new Position(0, 1), new Position(1, 0), new Position(1, 1), new Position(2, 1)]
        ]
      ),
      // I-Block
      new Block(
        new Position(-1, 3),
        VirtualMap.ALLOWED_COLORS.YELLOW,
        [
          [new Position(1, 0), new Position(1, 1), new Position(1, 2), new Position(1, 3)],
          [new Position(0, 2), new Position(1, 2), new Position(2, 2), new Position(3, 2)],
          [new Position(2, 0), new Position(2, 1), new Position(2, 2), new Position(2, 3)],
          [new Position(0, 1), new Position(1, 1), new Position(2, 1), new Position(3, 1)]
        ]
      ),
      // O-Block
      new Block(
        new Position(0, 4),
        VirtualMap.ALLOWED_COLORS.PURPLE,
        [
          [new Position(0, 0), new Position(0, 1), new Position(1, 0), new Position(1, 1)]
        ]
      )
    ]);

    this.currentBlock = this.bag.getAndUpdate();
    this.nextBlock = this.bag.getAndUpdate();
  }


  public blockFits = (): boolean => {
    for (const position of this.currentBlock.getTilePositions()) {
      if (!this.grid.isEmpty(position.row, position.column)) {
        return false;
      }
    }
    return true;
  };

  public rotateBlock = (): void => {
    this.currentBlock.rotateClockwise();

    if (!this.blockFits()) {
      this.currentBlock.rotateCounterClockwise();
    }
  };

  public moveBlockLeft = (): void => {
    this.currentBlock.move(0, -1);

    if (!this.blockFits()) {
      this.currentBlock.move(0, 1);
    }
  };

  public moveBlockRight = (): void => {
    this.currentBlock.move(0, 1);

    if (!this.blockFits()) {
      this.currentBlock.move(0, -1);
    }
  };

  public moveBlockDown = (): void => {
    this.currentBlock.move(1, 0);

    if (!this.blockFits()) {
      this.currentBlock.move(-1, 0);
      this.placeBlock();
    }
  };

  private isGameOver = (): boolean => {
    this.gameOver = !(this.grid.isRowEmpty(0) && this.grid.isRowEmpty(1));

    return this.gameOver;
  };

  public placeBlock = (): void => {
    for (const position of this.currentBlock.getTilePositions()) {
      this.grid.setCellValue(position.row, position.column, this.currentBlock.getColor());
    }

    this.score += this.grid.clearFullRows();

    if (!this.isGameOver()) {
      this.currentBlock = this.nextBlock;
      this.nextBlock = this.bag.getAndUpdate();
      this.nextBlock.reset();
    }
  };

  public getScore = (): number => {
    return this.score;
  };

  public getGameOver = (): boolean => {
    return this.gameOver;
  };

  public getGameGrid = (): GameGrid => {
    return this.grid;
  };

  public getCurrentBlock = (): Block => {
    return this.currentBlock;
  };

  public getNextBlock = (): Block => {
    return this.nextBlock;
  };

}