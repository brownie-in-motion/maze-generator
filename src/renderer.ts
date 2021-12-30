import { BoardCell } from './types.js';

export default class Renderer {
  ctx: CanvasRenderingContext2D;
  pixel: number;

  constructor(canvas: HTMLCanvasElement, pixel: number) {
    this.ctx = canvas.getContext('2d')!;
    this.pixel = pixel;
  }

  size(board: BoardCell[][]) {
    return {
      width: board.length * this.pixel,
      height: board[0].length * this.pixel,
    };
  }

  draw(board: BoardCell[][]) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const cell = board[i][j];
        switch (cell) {
          case BoardCell.Empty:
            this.ctx.fillStyle = '#fff';
            break;
          case BoardCell.Wall:
            this.ctx.fillStyle = '#000';
            break;
          case BoardCell.Start:
            this.ctx.fillStyle = '#0f0';
            break;
          case BoardCell.Finish:
            this.ctx.fillStyle = '#f00';
            break;
          case BoardCell.Unknown:
            this.ctx.fillStyle = '#666';
            break;
        }
        this.ctx.fillRect(
          i * this.pixel,
          j * this.pixel,
          this.pixel,
          this.pixel
        );
      }
    }
  }
}
