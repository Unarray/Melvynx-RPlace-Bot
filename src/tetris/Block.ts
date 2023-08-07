import { Position } from "./Position";

export class Block {

  private tiles: Position[][];

  private startOffset: Position;

  private color: string;

  private rotationState = 0;

  private offset: Position;

  constructor(startOffset: Position, color: string, tiles: Position[][]) {
    this.startOffset = startOffset;
    this.offset = new Position(startOffset.row, startOffset.column);
    this.color = color;
    this.tiles = tiles;
  }


  public getColor = (): string => {
    return this.color;
  };

  public getTilePositions = (): Position[] => {
    const tilePositions: Position[] = [];

    for (const position of this.tiles[this.rotationState]) {
      tilePositions.push(new Position(
        position.row + this.offset.row,
        position.column + this.offset.column,
      ));
    }

    return tilePositions;
  };

  public rotateClockwise = (): void => {
    this.rotationState = (this.rotationState + 1) % this.tiles.length;
  };

  public rotateCounterClockwise = (): void => {
    this.rotationState = (this.rotationState === 0 ? this.tiles.length : this.rotationState) - 1;
  };

  public move = (rows: number, columns: number): void => {
    this.offset.row += rows;
    this.offset.column += columns;
  };

  public reset = (): void => {
    this.rotationState = 0;
    this.offset = new Position(this.startOffset.row, this.startOffset.column);
  };

}