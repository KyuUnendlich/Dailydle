import seedrandom from 'seedrandom';
const rng = seedrandom('mySeed');
const seedRngUsed: boolean = false;

export type Grid = (number | null)[][];
type Coord = readonly [x: number, y: number];
export interface QueensGame {
  puzzle: Grid;
  solution: Grid;
}

export function generatePuzzle(): QueensGame {
  for (let attempt = 0; attempt < 10; attempt++) {
    let grid: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    let availableRows: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
    let availableColumns: number[] = [0, 1, 2, 3, 4, 5, 6, 7];

    let positionsByColor: Coord[][] = Array.from(
      { length: 8 },
      () => []
    );

    fillQueens(grid, availableRows, availableColumns, 0, positionsByColor);

    const filledCellCount = grid.flat().filter(cell => cell !== null).length;

    if (filledCellCount >= 8) {
      fillFirstNeighbor(grid, positionsByColor);



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

function fillQueens(grid: Grid, availableRows: number[], availableColumns: number[], colorID: number, positionsByColor: Coord[][]): void {
  let attemptsCount = 0;
  let foundSolution = false;

  outer:
  while(attemptsCount < 5 && foundSolution === false){
    attemptsCount++;

    let rngC = availableColumns[getRandomInt(0, availableColumns.length - 1)];
    let rngR = availableRows[getRandomInt(0, availableRows.length - 1)];
    let newAvailableColumns = availableColumns.filter(n => n !== rngC);
    let newAvailableRows = availableRows.filter(n => n !== rngR);

    console.log(`--- Color ${colorID} - Attempt ${attemptsCount} ---`);
  
    //check corner validity
    for (let intC = -1; intC < 2; intC = intC +2) {
      for (let intR = -1; intR < 2; intR = intR +2) {
        let newC = rngC + intC;
        let newR = rngR + intR;

        if (newC >= 0 && newR >= 0 && newC < 8 && newR < 8){
          if (grid[newC][newR] !== null){
            console.log(`❌ Rejected: corner at x=${newC}, y=${newR} is occupied by:`, grid[newC][newR]);
            continue outer; // exits both loops
          }
        }
      }
    }
    foundSolution = true;
    attemptsCount = 10;
    grid[rngC][rngR] = colorID;
    positionsByColor[colorID!].push([rngC,rngR]);
    console.log(`✅ Valid solution found at x=${rngC}, y=${rngR}`);
    if (colorID < 7) {
      fillQueens(grid, newAvailableRows, newAvailableColumns, colorID + 1, positionsByColor);
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
