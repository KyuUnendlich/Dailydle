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
  for (let attempt = 0; attempt < 1; attempt++) {
    let grid: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    let availableRows: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
    let availableColumns: number[] = [0, 1, 2, 3, 4, 5, 6, 7];

    fillQueens(grid, availableRows, availableColumns, 0);

    const filledCellCount = grid.flat().filter(cell => cell !== null).length;

    if (filledCellCount >= 8) {
      const solution = structuredClone(grid);
      const puzzle: Grid = grid.map(row =>
        row.map(cell => (cell === null ? null : 1))
      );

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

    let rngX = availableColumns[getRandomInt(0, availableColumns.length - 1)];
    let rngY = availableRows[getRandomInt(0, availableRows.length - 1)];
    let newAvailableColumns = availableColumns.filter(n => n !== rngX);
    let newAvailableRows = availableRows.filter(n => n !== rngY);

    console.log(`--- Color ${colorID} - Attempt ${attemptsCount} ---`);
  
    //check corner validity
    for (let intX = -1; intX < 2; intX = intX +2) {
      for (let intY = -1; intY < 2; intY = intY +2) {
        let newX = rngX + intX;
        let newY = rngY + intY;

        if (newX >= 0 && newY >= 0 && newX < 8 && newY < 8){
          if (grid[newX][newY] !== null){
            console.log(`❌ Rejected: corner at x=${newX}, y=${newY} is occupied by:`, grid[newX][newY]);
            continue outer; // exits both loops
          }
        }
      }
    }
    foundSolution = true;
    attemptsCount = 10;
    grid[rngX][rngY] = colorID;
    console.log(`✅ Valid solution found at x=${rngX}, y=${rngY}`);
    if (colorID < 7) {
      fillQueens(grid, newAvailableRows, newAvailableColumns, colorID + 1);
      return;
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
