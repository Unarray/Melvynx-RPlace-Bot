
export class GameGrid {

  public readonly grid: string[][];

  private rows: number;

  private columns: number;

  private emptyValue: string;

  constructor(rows: number, columns: number, emptyValue: string) {
    this.rows = rows;
    this.columns = columns;
    this.emptyValue = emptyValue;
    this.grid = Array.from(
      { length: rows },
      () => Array.from(
        { length: columns },
        () => emptyValue
      )
    );
  }

  public isInside = (row: number, column: number): boolean =>  {
    return row >= 0 && row < this.rows && column >= 0 && column < this.columns;
  };

  public isEmpty = (row: number, column: number): boolean =>  {
    return this.isInside(row, column) && this.grid[row][column] == this.emptyValue;
  };

  public isRowEmpty = (row: number): boolean => {
    for (let column = 0; column < this.columns; column++) {
      if (this.grid[row][column] !== this.emptyValue) return false;
    }

    return true;
  };

  public isRowFull = (row: number): boolean => {
    for (let column = 0; column < this.columns; column++) {
      if (this.grid[row][column] === this.emptyValue) return false;
    }

    return true;
  };

  public clearRow = (row: number):void => {
    this.grid[row].fill(this.emptyValue);
  };

  public moveRowDown = (row: number, amount: number): void => {
    const rowValues = [...this.grid[row]];

    this.grid[row + amount] = rowValues;
    this.clearRow(row);
  };

  public clearFullRows = (): number => {
    let cleared = 0;

    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.isRowFull(row)) {
        this.clearRow(row);
        cleared++;
      } else if (cleared > 0) {
        this.moveRowDown(row, cleared);
      }
    }

    return cleared;
  };

  public setCellValue = (row: number, column: number, value: string): void => {
    this.grid[row][column] = value;
  };

}