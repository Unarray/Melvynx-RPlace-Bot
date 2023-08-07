import type { Position } from "./Position";

export type TetrisConfig = {
  background: {
    texturePath: string;
  };
  controlls:{
    left: BasicElement;
    right: BasicElement;
    rotate: BasicElement;
    down: BasicElement;
  };
  blockPreview: BasicElement & {
    block: {
      offset: Position;
    };
  };
  grid: BasicElement;
}

export type BasicElement = {
  texturePath: string;
  offset: Position;
}