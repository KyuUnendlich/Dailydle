import seedrandom from 'seedrandom';
const rng = seedrandom('mySeed');
const seedRngUsed: boolean = false;

export type Grid = (number | null)[][];
export interface QueensGame {
  puzzle: Grid;
  solution: Grid;
}

//export function generatePuzzle(): QueensGame {
 // const puzzle: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
  //const solution: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
  //turn { puzzle, solution };
//}

export function generatePuzzle(): QueensGame {
  for (let attempt = 0; attempt < 100; attempt++) {
    let grid: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let availableRows: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
        let availableColumns: number[] = [0, 1, 2, 3, 4, 5, 6, 7];

        fillQueens(grid, availableRows, availableColumns, 0);
      }
    }

    if (grid.every(row => row.every(cell => cell !== null))) {
      const solution = structuredClone(grid);
      const puzzle: Grid = grid.map(row => row.map(cell => (cell === null ? null : 1)));
      return { puzzle, solution };
    }
  }

  const empty: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
  return { puzzle: empty, solution: structuredClone(empty) };
}

function fillQueens(grid: Grid, availableRows: number[], availableColumns: number[], colorID: number): void {
  let attemptsCount = 0;
  let foundSolution = false;

  outer:
  while(attemptsCount < 5 && foundSolution === false){
    attemptsCount++;

    let rngX = availableRows[getRandomInt(0, availableRows.length - 1)];
    let rngY = availableColumns[getRandomInt(0, availableColumns.length - 1)];
    let newAvailableRows = availableRows.filter(n => n !== rngX);
    let newAvailableColumns = availableColumns.filter(n => n !== rngY);
  
    //check corner validity
    for (let intX = -1; intX < 2; intX = intX +2) {
      for (let intY = -1; intY < 2; intY = intY +2) {
        let newX = rngX + intX;
        let newY = rngY + intY;

        if (newX >= 0 && newY >= 0 && newX < 8 && newY < 8){
          if (grid[newX][newY] !== null){
            continue outer; // exits both loops
          }
        }
      }
    }
    foundSolution = true;
    grid[rngX][rngY] = colorID;
    if (colorID < 7) {
      fillQueens(grid, newAvailableRows, newAvailableColumns, colorID + 1);
    }
  }
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

export const getCell = (grid: Grid, row: number, col: number): number | null => {
  return grid[row][col];
};

export const setCell = (grid: Grid, row: number, col: number, value: number | null): Grid => {
  const next = grid.map((r) => [...r]);
  next[row][col] = value;
  return next;
};
