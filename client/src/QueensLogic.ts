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
  { value: 0,    weight: 30 }, // 30%
  { value: 1,   weight: 20 }, // 20%
  { value: 2,  weight: 15 }, // 15%
  { value: 3, weight: 10 }, // 10%
  { value: 4, weight: 8 },  // 8%
  { value: 5, weight: 7 },  // 7%
  { value: 6,   weight: 5 },  // 5%
  { value: 7,  weight: 5 },  // 5%
]

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

      let colorWeight = calculateColorChances();
      fillRest(grid, positionsByColor, colors);

      const solution = structuredClone(grid);
      const puzzle: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));

      return { puzzle, solution };
    }
  }

  const empty: Grid = Array.from({ length: 8 }, () => Array(8).fill(null));
  return { puzzle: empty, solution: structuredClone(empty) };
}

function fillRest(grid: Grid, positionsByColor: Coord[][], colorWeight: ColorWeight[]): void {
  for (let i = 0; i < 1000; i++){
    const pickedColor = pickWeighted(colorWeight);
    console.log(`--- Color ${pickedColor}`);
    const coords = positionsByColor[pickedColor];

    let rngAmount = getRandomInt(0,coords.length-1)
    let col = coords[rngAmount][0]
    let row = coords[rngAmount][1]

    let count = 0;
    let unfilled = true;
    while (unfilled && count < 5){
      let rng1 = getRandomInt(0,3);
      count++;
      switch (rng1) {
        case 0:
          if (col !== 0){
            if (grid[col-1][row] === null){
              if (checkNoOtherSolutionExists(grid, [col-1, row])) {
                grid[col-1][row] = pickedColor;
                positionsByColor[pickedColor!].push([col-1,row]);
                unfilled = false;
              }
            }
          }
          break;
        case 1:
          if (col !== 7){
            if (grid[col+1][row] === null){
              if (checkNoOtherSolutionExists(grid, [col+1, row])) {
                grid[col+1][row] = pickedColor;
                positionsByColor[pickedColor!].push([col+1,row]);
                unfilled = false;
              }
            }
          }
          break;
        case 2:
          if (row !== 0){
            if (grid[col][row-1] === null){
              if (checkNoOtherSolutionExists(grid, [col, row-1])) {
                grid[col][row-1] = pickedColor;
                positionsByColor[pickedColor!].push([col,row-1]);
                unfilled = false;
              }
            }
          }
          break;
        case 3:
          if (row !== 7){
            if (grid[col][row+1] === null){
              if (checkNoOtherSolutionExists(grid, [col, row+1])) {
                grid[col][row+1] = pickedColor;
                positionsByColor[pickedColor!].push([col,row+1]);
                unfilled = false;
              }
            }
          }
        break;
      }
    }
  }
}

function checkNoOtherSolutionExists (grid: Grid, coord: Coord): Boolean {

  return true;
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









function pickWeighted<T>(items: WeightedItem<T>[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight <= 0) {
    throw new Error("Total weight must be greater than 0");
  }

  const roll = Math.random() * totalWeight;

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

export const getCell = (grid: Grid, row: number, col: number): number | null => {
  return grid[row][col];
};

export const setCell = (grid: Grid, row: number, col: number, value: number | null): Grid => {
  const next = grid.map((r) => [...r]);
  next[row][col] = value;
  return next;
};
