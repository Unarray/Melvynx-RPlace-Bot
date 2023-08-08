import { logger } from "#/utils/logger";
import { randomInt } from "crypto";

export class Bag<T> {

  private items: T[];


  private nextItem: T;

  constructor(items: T[]) {
    this.items = [...items];
    this.nextItem = this.getRandomItem();
  }

  private getRandomItem = (): T => {
    return this.items[randomInt(this.items.length)];
  };

  public getAndUpdate = (): T => {
    const item = this.nextItem;

    do {
      this.nextItem = this.getRandomItem();
      logger.info("do while !");
    } while (this.nextItem === item);

    return item;
  };

}