export type Grid = (number | null)[][];

export function createEmptyGrid(): Grid {
  return Array.from({ length: 6 }, () => Array(6).fill(null));
}

export const getCell = (grid: Grid, row: number, col: number): number | null => {
  return grid[row][col];
};

export const setCell = (grid: Grid, row: number, col: number, value: number | null): Grid => {
  const next = grid.map((r) => [...r]);
  next[row][col] = value;
  return next;
};
