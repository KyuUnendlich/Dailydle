export type Grid = (number | null)[][];
export interface QueensGame {
  puzzle: Grid;
  solution: Grid;
}

export function generatePuzzle(): QueensGame {
  const puzzle: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
  const solution: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
  return { puzzle, solution };
}

export const getCell = (grid: Grid, row: number, col: number): number | null => {
  return grid[row][col];
};

export const setCell = (grid: Grid, row: number, col: number, value: number | null): Grid => {
  const next = grid.map((r) => [...r]);
  next[row][col] = value;
  return next;
};
