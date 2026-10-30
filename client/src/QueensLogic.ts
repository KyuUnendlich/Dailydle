import seedrandom from 'seedrandom';
const rng = seedrandom('mySeed');
const seedRngUsed: boolean = false;

export type Grid = (number | null)[][];
export interface QueensGame {
  puzzle: Grid;
  solution: Grid;
}
type Coord = readonly [x: number, y: number];
type ColorWeight = { value: number; weight: number };
type WeightedItem<T> = {
  value: T;
  weight: number;
};

let colors = [
  { value: 0,    weight: 35 }, // 35%
  { value: 1,   weight: 25 }, // 25%
  { value: 2,  weight: 15 }, // 15%
  { value: 3, weight: 8 }, // 10%
  { value: 4, weight: 5 },  // 8%
  { value: 5, weight: 10 },  // 7%
  { value: 6,   weight: 0 },  // 5%
  { value: 7,  weight: 2 },  // 5%
]

export function generatePuzzle(): QueensGame {
  for (let attempt = 0; attempt < 500; attempt++) {
    let grid: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    let availableRows: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
    let availableColumns: number[] = [0, 1, 2, 3, 4, 5, 6, 7];

    let positionsByColor: Coord[][] = Array.from(
      { length: 8 },
      () => []
    );

    if (!fillQueens(grid, availableColumns, availableRows, 0, positionsByColor)) {
      continue;
    }

    if (!fillRest(grid, positionsByColor, colors)) {
      continue;
    }

    const solution = structuredClone(grid);
    const puzzle: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));

    return { puzzle, solution };
  }

  const empty: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
  return { puzzle: empty, solution: structuredClone(empty) };
}

const FILL_NODE_BUDGET = 250;

function fillRest(grid: Grid, positionsByColor: Coord[][], colorWeight: ColorWeight[]): boolean {
  let remaining = 0;
  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 8; row++) {
      if (grid[col][row] === null) remaining++;
    }
  }

  return growRegions(grid, remaining, { nodes: 0 });
}

function growRegions(
  grid: Grid,
  remaining: number,
  budget: { nodes: number }
): boolean {
  if (++budget.nodes > FILL_NODE_BUDGET) {
    return false;
  }

  if (remaining === 0) {
    return !hasMultipleSolutions(grid);
  }

  const moves = getPossibleMoves(grid);
  shuffleInPlace(moves);

  for (const [col, row, color] of moves) {
    grid[col][row] = color;

    if (!hasMultipleSolutions(grid) && growRegions(grid, remaining - 1, budget)) {
      return true;
    }

    grid[col][row] = null;
  }

  return false;
}

function getPossibleMoves(grid: Grid): [number, number, number][] {
  const moves: [number, number, number][] = [];
  const seen = new Set<string>();
  const directions: Coord[] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 8; row++) {
      if (grid[col][row] !== null) continue;

      for (const [dc, dr] of directions) {
        const neighborCol = col + dc;
        const neighborRow = row + dr;

        if (neighborCol < 0 || neighborCol > 7 || neighborRow < 0 || neighborRow > 7) {
          continue;
        }

        const color = grid[neighborCol][neighborRow];
        if (color === null) continue;

        const key = `${col},${row},${color}`;
        if (seen.has(key)) continue;

        seen.add(key);
        moves.push([col, row, color]);
      }
    }
  }

  return moves;
}

function hasMultipleSolutions(grid: Grid): boolean {
  return countSolutions(grid, 2) > 1;
}

function countSolutions(grid: Grid, maxSolutions: number): number {
  const usedColumns: boolean[] = Array(8).fill(false);
  const usedRegions: boolean[] = Array(8).fill(false);
  const queenColumnByRow: number[] = Array(8).fill(-1);

  let count = 0;

  const search = (row: number): void => {
    if (count >= maxSolutions) return;

    if (row === 8) {
      count++;
      return;
    }

    for (let col = 0; col < 8; col++) {
      if (usedColumns[col]) continue;

      const region = grid[col][row];
      if (region === null || usedRegions[region]) continue;

      if (row > 0 && Math.abs(col - queenColumnByRow[row - 1]) === 1) continue;

      usedColumns[col] = true;
      usedRegions[region] = true;
      queenColumnByRow[row] = col;

      search(row + 1);

      usedColumns[col] = false;
      usedRegions[region] = false;

      if (count >= maxSolutions) return;
    }
  };

  search(0);
  return count;
}

function shuffleInPlace<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [items[i], items[j]] = [items[j], items[i]];
  }
}

function calculateColorChances (): ColorWeight[] {
  let allPossibleColors: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
  let colorWeights = new Array(8);
  let remainingPercentage = 1;
  
  for (let i = 0; i < 7; i++){
    let rngColorID = allPossibleColors[getRandomInt(0,allPossibleColors.length - 1)];
    allPossibleColors = allPossibleColors.filter(n => n !== rngColorID);
    let rngAmount = getRandomInt(5,22/remainingPercentage*1.2); // later colors have higher max chance

    rngAmount = rngAmount * remainingPercentage;
    rngAmount = Math.round(rngAmount);
    
    if (remainingPercentage * 100 - rngAmount < 0){
      rngAmount = remainingPercentage;
      remainingPercentage = 0;
    }

    colorWeights[i] = { value: rngColorID, weight: rngAmount };
    console.log(`--- Color ${rngColorID} - Weight ${rngAmount} - Remaining ${remainingPercentage}`);
    remainingPercentage -= rngAmount / 100;
    remainingPercentage = Math.round(remainingPercentage * 100) / 100;
  }
  colorWeights[7] = { value: allPossibleColors[0], weight: remainingPercentage * 100 };
  console.log(`--- Color ${allPossibleColors[0]} - Weight ${remainingPercentage * 100} ---`);

  return colorWeights;
}

function fillFirstNeighbor(grid: Grid, positionsByColor: Coord[][]): void {
  let dupeGrid = structuredClone(grid);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (dupeGrid[col][row] !== null){
        let colorID = dupeGrid[col][row];
        let unfilled = true;
        while (unfilled){
          let rng1 = getRandomInt(0,3);
          switch (rng1) {
            case 0:
              if (col !== 0){
                grid[col-1][row] = colorID;
                positionsByColor[colorID!].push([col-1,row]);
                unfilled = false;
              }
              break;
            case 1:
              if (col !== 7){
                grid[col+1][row] = colorID;
                positionsByColor[colorID!].push([col+1,row]);
                unfilled = false;
              }
              break;
            case 2:
              if (row !== 0){
                grid[col][row-1] = colorID;
                positionsByColor[colorID!].push([col,row-1]);
                unfilled = false;
              }
              break;
            case 3:
              if (row !== 7){
                grid[col][row+1] = colorID;
                positionsByColor[colorID!].push([col,row+1]);
                unfilled = false;
              }
              break;
          }
        }

      }
    }
  }
}

function fillQueens(grid: Grid, availableColumns: number[], availableRows: number[], colorID: number, positionsByColor: Coord[][]): boolean {
  if (colorID >= 8) {
    return true;
  }

  const rows = [...availableRows];
  shuffleInPlace(rows);

  for (const row of rows) {
    const columns = [...availableColumns];
    shuffleInPlace(columns);

    for (const col of columns) {
      let valid = true;

      for (let previousColor = 0; previousColor < colorID; previousColor++) {
        const [previousCol, previousRow] = positionsByColor[previousColor][0];

        if (Math.abs(previousCol - col) === 1 && Math.abs(previousRow - row) === 1) {
          valid = false;
          break;
        }
      }

      if (!valid) continue;

      grid[col][row] = colorID;
      positionsByColor[colorID].push([col, row]);

      const placedRest = fillQueens(
        grid,
        availableColumns.filter((n) => n !== col),
        availableRows.filter((n) => n !== row),
        colorID + 1,
        positionsByColor
      );

      if (placedRest) {
        return true;
      }

      positionsByColor[colorID].pop();
      grid[col][row] = null;
    }
  }

  return false;
}









function pickWeighted<T>(items: WeightedItem<T>[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight <= 0) {
    throw new Error("Total weight must be greater than 0");
  }

  const roll = getRandomInt(0, 1) * totalWeight;

  let currentWeight = 0;

  for (const item of items) {
    currentWeight += item.weight;

    if (roll < currentWeight) {
      return item.value;
    }
  }

  // Fallback for floating-point edge cases
  return items[items.length - 1].value;
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
	if (seedRngUsed){
		return Math.floor(rng() * (max - min + 1)) + min;
	} else {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}

export const isSolved = (game: QueensGame): boolean => {
  if (game.solution[0][0] === null) return false;

  const usedRows = new Set<number>();
  const usedColumns = new Set<number>();
  const usedRegions = new Set<number>();
  const queenColumnsByRow: number[] = [];
  let count = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (game.puzzle[col][row] !== 1) continue;

      const region = game.solution[col][row];
      if (region === null) return false;
      if (usedRows.has(row) || usedColumns.has(col) || usedRegions.has(region)) {
        return false;
      }

      usedRows.add(row);
      usedColumns.add(col);
      usedRegions.add(region);
      queenColumnsByRow[row] = col;
      count++;
    }
  }

  if (count !== 8) return false;

  for (let row = 1; row < 8; row++) {
    if (Math.abs(queenColumnsByRow[row] - queenColumnsByRow[row - 1]) === 1) {
      return false;
    }
  }

  return true;
};

export const getCell = (grid: Grid, row: number, col: number): number | null => {
  return grid[col][row];
};

export const setCell = (grid: Grid, row: number, col: number, value: number | null): Grid => {
  const next = grid.map((r) => [...r]);
  next[col][row] = value;
  return next;
};
