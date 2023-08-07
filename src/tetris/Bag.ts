export class Bag<T> {

  private items: T[];

  private bagItems: T[];

  constructor(items: T[]) {
    this.items = [...items];
    this.bagItems = this.shuffleBlocks();
  }

  public shuffleBlocks = (): T[] => {
    const shuffledBlocks = [...this.items];

    for (let i = shuffledBlocks.length - 1; i > 0; i--) {
      const random = Math.floor(Math.random() * (i + 1));
      [shuffledBlocks[i], shuffledBlocks[random]] = [shuffledBlocks[random], shuffledBlocks[i]];
    }

    return shuffledBlocks;
  };

  public getAndUpdate = (): T => {
    const item = this.bagItems.shift();

    if (item === undefined) {
      throw new Error("Impossible d'arriver ici...");
    }

    if (this.bagItems.length === 0) {
      this.bagItems = this.shuffleBlocks();
    }

    return item;
  };

}