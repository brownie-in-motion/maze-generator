import { BoardCell } from './types.js';

export class RandomDFS {
  width: number;
  height: number;
  state: {
    board: BoardCell[][];
    visited: Set<number>;
    stack: number[];
  };

  constructor(width: number, height: number) {
    this.width = width * 2 + 1;
    this.height = height * 2 + 1;
    this.state = {
      board: Array(this.width)
        .fill(BoardCell.Wall)
        .map(() => Array(this.height).fill(BoardCell.Wall)),
      visited: new Set([this.hash(1, 1)]),
      stack: [this.hash(1, 1)],
    };
  }

  hash(x: number, y: number) {
    return x + y * this.width;
  }

  position(hash: number) {
    return {
      x: hash % this.width,
      y: Math.floor(hash / this.width),
    };
  }

  isValid(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  adjacent(x: number, y: number) {
    return [
      { x: x - 2, y: y },
      { x: x + 2, y: y },
      { x: x, y: y - 2 },
      { x: x, y: y + 2 },
    ].filter(({ x, y }) => this.isValid(x, y));
  }

  step(): boolean {
    if (this.state.stack.length === 0) return false;

    const hash = this.state.stack.pop()!;
    const { x, y } = this.position(hash);

    const unvisited = this.adjacent(x, y).filter(
      ({ x, y }) => !this.state.visited.has(this.hash(x, y))
    );

    if (unvisited.length === 0) return this.step();

    this.state.stack.push(hash);

    this.fill(x, y);

    const index = Math.floor(Math.random() * unvisited.length);
    const { x: x_, y: y_ } = unvisited[index];
    this.fill(x_, y_);
    this.fill((x + x_) / 2, (y + y_) / 2);

    const next = this.hash(x_, y_);

    this.state.visited.add(next);
    this.state.stack.push(next);

    return true;
  }

  fill(x: number, y: number) {
    if (x == 1 && y == 1) {
      this.state.board[x][y] = BoardCell.Start;
    } else if (x == this.width - 2 && y == this.height - 2) {
      this.state.board[x][y] = BoardCell.Finish;
    } else {
      this.state.board[x][y] = BoardCell.Empty;
    }
  }

  board() {
    return this.state.board;
  }
}

enum WilsonState {
  PickPoint,
  Walk,
  Fill,
  Loop,
}

export class Wilson {
  width: number;
  height: number;
  state: {
    board: BoardCell[][];
    maze: Set<number>;
    current: Set<number>;
    position: {
      x: number;
      y: number;
    };
    previous: {
      x: number;
      y: number;
    };
    state: WilsonState;
  };

  constructor(width: number, height: number) {
    this.width = width * 2 + 1;
    this.height = height * 2 + 1;
    this.state = {
      board: Array(this.width)
        .fill(BoardCell.Wall)
        .map(() => Array(this.height).fill(BoardCell.Wall)),
      maze: new Set([this.hash(1, 1)]),
      current: new Set([this.hash(1, 1)]),
      position: {
        x: 1,
        y: 1,
      },
      previous: {
        x: 1,
        y: 1,
      },
      state: WilsonState.PickPoint,
    };

    this.fill(1, 1);
  }

  hash(x: number, y: number) {
    return x + y * this.width;
  }

  position(hash: number) {
    return {
      x: hash % this.width,
      y: Math.floor(hash / this.width),
    };
  }

  isValid(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  adjacent(x: number, y: number) {
    return [
      { x: x - 2, y: y },
      { x: x + 2, y: y },
      { x: x, y: y - 2 },
      { x: x, y: y + 2 },
    ].filter(({ x, y }) => this.isValid(x, y));
  }

  neighbors(x: number, y: number) {
    return [
      { x: x - 1, y: y },
      { x: x + 1, y: y },
      { x: x, y: y - 1 },
      { x: x, y: y + 1 },
    ].filter(({ x, y }) => this.isValid(x, y));
  }

  step() {
    switch (this.state.state) {
      case WilsonState.PickPoint:
        for (let i = 1; i < this.width; i += 2) {
          for (let j = 1; j < this.height; j += 2) {
            if (this.state.board[i][j] === BoardCell.Wall) {
              this.state.position.x = i;
              this.state.position.y = j;
              this.mark(i, j);

              this.state.current = new Set([this.hash(i, j)]);
              this.state.state = WilsonState.Walk;
              return true;
            }
          }
        }
        return false;
      case WilsonState.Walk:
        const adjacent = this.adjacent(
          this.state.position.x,
          this.state.position.y
        );
        const index = Math.floor(Math.random() * adjacent.length);
        const { x, y } = adjacent[index];

        if (this.state.current.has(this.hash(x, y))) {
          this.state.previous = { ...this.state.position };
          this.state.position = { x, y };

          this.state.state = WilsonState.Loop;
          this.step();
          return true;
        }

        this.state.current.add(
          this.hash(
            (this.state.position.x + x) / 2,
            (this.state.position.y + y) / 2
          )
        );
        this.state.current.add(this.hash(x, y));

        this.mark(
          (x + this.state.position.x) / 2,
          (y + this.state.position.y) / 2
        );
        this.mark(x, y);

        if (this.state.maze.has(this.hash(x, y))) {
          this.state.state = WilsonState.Fill;
          this.step();
          return true;
        }

        this.state.position = { x, y };
        break;
      case WilsonState.Loop:
        const path = [...this.state.current];
        path.reverse();

        for (const hash of path) {
          const { x, y } = this.position(hash);
          if (this.state.position.x === x && this.state.position.y === y) {
            break;
          }

          this.state.board[x][y] = BoardCell.Wall;
          this.state.current.delete(hash);
        }

        this.state.state = WilsonState.Walk;
        break;
      case WilsonState.Fill:
        for (const hash of this.state.current) {
          const { x, y } = this.position(hash);
          this.fill(x, y);
          this.state.maze.add(hash);
        }

        this.state.state = WilsonState.PickPoint;
        break;
    }
    return true;
  }

  mark(x: number, y: number) {
    this.state.board[x][y] = BoardCell.Unknown;
  }

  fill(x: number, y: number) {
    if (x == 1 && y == 1) {
      this.state.board[x][y] = BoardCell.Start;
    } else if (x == this.width - 2 && y == this.height - 2) {
      this.state.board[x][y] = BoardCell.Finish;
    } else {
      this.state.board[x][y] = BoardCell.Empty;
    }
  }

  board() {
    const copy = this.state.board.map((row) => [...row]);
    return copy;
  }
}
