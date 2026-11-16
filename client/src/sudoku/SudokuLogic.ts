import seedrandom from 'seedrandom';
const rng = seedrandom('mySeed');
/** When true, random choices use the seeded RNG for reproducible puzzles. */
const seedRngUsed: boolean = false;

/** 6x6 sudoku grid stored as grid[row][column]; values are 1-6 or null. */
export type Grid = (number | null)[][];
/** Grid coordinate in [row, column] form. */
type Coordinate = [row: number, column: number];
/** A 6x6 sudoku puzzle, its solved grid, and which cells were given initially. */
export interface SudokuGame {
  puzzle: Grid;
  solution: Grid;
  initialState: Grid; // Tracks which cells were pre-filled (null for empty, number for given)
}


/**
 * Generates a 6x6 (2x3 boxes) sudoku puzzle by filling a grid, repairing common
 * defects, then removing cells while preserving a unique solution.
 */
export function generatePuzzle(): SudokuGame {
	while (true) {
		let grid: Grid = Array.from({ length: 6 }, () => Array(6).fill(null));
		for (let i = 0; i < 6; i++) {
			for (let j = 0; j < 6; j++) {
				let validNumberArray: number[] = getValidNextNumber(grid, i, j)
				if (validNumberArray.length !== 0) {
					let nextNumberId: number = getRandomInt(0, validNumberArray.length - 1);
					grid[i][j] = validNumberArray[nextNumberId];
				}
			}
		}

		if (doCorrectionAlgorithm(grid)) {
			if (CheckGrid(grid)) {
				const solution = structuredClone(grid);

				const clearedCells: boolean[][] = Array.from({ length: 6 }, () => Array(6).fill(false));

				for (let i = 0; i < 25; i++){
					let clearRowId: number = getRandomInt(0, 5);
					let clearColumnId: number = getRandomInt(0, 5);

					if (clearedCells[clearRowId][clearColumnId] === true) {
						let rng01: number = getRandomInt(0, 1);
						i -= rng01; // Try again sometimes
					} else {

						// try clearing a cell
						const originalValue = grid[clearRowId][clearColumnId];
						grid[clearRowId][clearColumnId] = null;
						if (countSolutions(grid) !== 1) {
							grid[clearRowId][clearColumnId] = originalValue; // not unique → restore
						}
						// if it returned 1, keep it cleared
						clearedCells[clearRowId][clearColumnId] = true;

					}
				}
				// Store the original grid state (this represents cells that were pre-filled)
			const initialState = Array.from({ length: 6 }, () => Array(6).fill(null));
			for (let i = 0; i < 6; i++) {
				for (let j = 0; j < 6; j++) {
					if (clearedCells[i][j] === false) {
						initialState[i][j] = grid[i][j];
					}
				}
			}

			return { puzzle: grid, solution, initialState };
			}
		}
	}
}

/** Counts solutions via backtracking up to `maxSolutions` for uniqueness checks. */
function countSolutions(grid: Grid, maxSolutions: number = 2): number {
  	// 1. Find the first empty cell
	let row = -1, col = -1;
	for (let r = 0; r < 6; r++) {
		for (let c = 0; c < 6; c++) {
		if (grid[r][c] === null) { row = r; col = c; break; }
		}
		if (row !== -1) break;
	}
	// 2. No empty cell left -> we found a complete, valid solution
	if (row === -1) return 1;
	// 3. Try every candidate, counting how many lead to a solution
	let count = 0;
	for (let num = 1; num <= 6; num++) {
		if (isValid(grid, row, col, num)) {
		grid[row][col] = num;   // place
		count += countSolutions(grid, maxSolutions); // recurse
		grid[row][col] = null;  // backtrack (undo)
		if (count >= maxSolutions) break; // early exit
		}
	}
	return count;
}

/** Checks whether `num` can be placed at (row, col) under 6x6 row/column/2x3-box rules. */
function isValid(grid: Grid, row: number, col: number, num: number): boolean {
	for (let i = 0; i < 6; i++) {
		if (grid[row][i] === num) return false; // row
		if (grid[i][col] === num) return false; // column
	}
	const boxRow = Math.floor(row / 2) * 2;
	const boxCol = Math.floor(col / 3) * 3;
	for (let r = boxRow; r < boxRow + 2; r++) {
		for (let c = boxCol; c < boxCol + 3; c++) {
		if (grid[r][c] === num) return false; // box
		}
	}
	return true;
}

/** Verifies the grid is completely filled and each row, column, and 2x3 box contains 1-6 once. */
function CheckGrid(grid: Grid): boolean {
	for (let i = 0; i < 6; i++) {
		const rowSet: Set<number> = new Set();
		const columnSet: Set<number> = new Set();
		for (let j = 0; j < 6; j++) {
			const rowValue = grid[i][j];
			const columnValue = grid[j][i];
			if (rowValue === null || columnValue === null) {
				return false;
			}
			rowSet.add(rowValue);
			columnSet.add(columnValue);
		}
		if (rowSet.size !== 6 || columnSet.size !== 6) {
			return false;
		}

		const boxSet: Set<number> = new Set();
		getBoxCoordinatesById(i).forEach(element => {
			const value = grid[element[0]][element[1]];
			if (value === null) {
				return;
			}
			boxSet.add(value);
		});
		if (boxSet.size !== 6) {
			return false;
		}
	}
	return true;
}



/**
 * Attempts to repair certain partially-invalid filled grids that end up with exactly
 * two empty cells by swapping two numbers in a related box and refilling the gaps.
 * Returns false when the grid is not in a supported repair state.
 */
function doCorrectionAlgorithm(grid: Grid): boolean {
	//This is honestly probably less efficient than just creating a new grid and hoping the next one generates correctly (~15% chance)
	//i like this too much though so ill keep it in, even if it only solves half the failed grids

	// Find 2 Empty Cells and switch cell numbers in adjacent boxes 
		// Find Logical Missing numbers in the respective Boxes
		// Find a singular box that is either in the same box-row or box-column and flip the numbers there   
		// 		(either missing ones are in the same box => search box-row or only same column => search other box in column)
		// Then fill in the 2 empty cells
	let emptyNumbers: number[] = []; // indices 0, 2, 4 are the rows; 1, 3, 5 are the columns
	let amountMap: Map<number, number> = new Map();
	for (let i = 0; i < 6; i++) {
		for (let j = 0; j < 6; j++) {
			if (grid[i][j] === null){
				emptyNumbers.push(i)
				emptyNumbers.push(j)
			} else {
				const curNumber = grid[i][j]!;
				if (amountMap.has(curNumber)) {
    				amountMap.set(curNumber, amountMap.get(curNumber)! + 1);
				} else {
    				amountMap.set(curNumber, 1);
				}
			}
		}
	}

	if (emptyNumbers.length === 0) {
		return true;
	}

	let missingNumbers: number[] = []; // missing numbers by box logic

	if (emptyNumbers.length === 4) {
		for (let int = 1; int < 7; int++) {
			let amountNum = amountMap.get(int);
			if (amountNum === 5) {
				missingNumbers.push(int);
			}
		}
	} else {
		return false;
	}

	let boxToFlip: number = 999;
	if (getMyBox([emptyNumbers[0],emptyNumbers[1]]) === getMyBox([emptyNumbers[2],emptyNumbers[3]])){
		// Missing numbers are in same box, take opposite box in Box-Row 
		boxToFlip = getMyBox([emptyNumbers[0],emptyNumbers[1]]) ^ 1 //bitflip
	} else {
		//Find missing box in column
		let addBoxes = getMyBox([emptyNumbers[0],emptyNumbers[1]]) + getMyBox([emptyNumbers[2],emptyNumbers[3]])
		if (addBoxes === 4) { // Boxes 0 & 2
			boxToFlip = 4
		}
		if (addBoxes === 6) {
			if (getMyBox([emptyNumbers[0],emptyNumbers[1]]) % 2 === 0) { // Boxes 1 & 3
 				boxToFlip = 5
			} else { // Boxes 0 & 4
				boxToFlip = 2
			}
		}
		if (addBoxes === 8) {
			if (getMyBox([emptyNumbers[0],emptyNumbers[1]]) % 2 === 0) { // Boxes 1 & 5
				boxToFlip = 3
			} else { // Boxes 2 & 4
				boxToFlip = 0
			}
		}
		if (addBoxes === 10) { // Boxes 3 & 5
			boxToFlip = 1
		}
	}

	getBoxCoordinatesById(boxToFlip).forEach(element => {
		if (grid[element[0]][element[1]] === missingNumbers[0]) {
			grid[element[0]][element[1]] = missingNumbers[1];
		} else if (grid[element[0]][element[1]] === missingNumbers[1]) {
			grid[element[0]][element[1]] = missingNumbers[0];
		}
	});


	for (let emp = 0; emp < 2; emp++) {
		let validNumberArray: number[] = getValidNextNumber(grid, emptyNumbers[emp*2],emptyNumbers[emp*2+1])
		if (validNumberArray.length !== 0) {
			let nextNumberId: number = getRandomInt(0, validNumberArray.length - 1);
			grid[emptyNumbers[emp*2]][emptyNumbers[emp*2 + 1]] = validNumberArray[nextNumberId];
		}
	}

	return true;
}

/** Returns all candidate numbers (1-6) that do not violate row, column, or 2x3-box constraints. */
function getValidNextNumber(grid: Grid, row: number, column: number): number[] {
  const invalidNumbers = new Set<number | null>();

  // Check Row Validity
  for (let col = 0; col < 6; col++) {
    if (grid[row][col] !== null && grid[row][col] !== undefined) {
      invalidNumbers.add(grid[row][col]);
    }
  }
  // Check Column Validity
  for (let ro = 0; ro < 6; ro++) {
    if (grid[ro][column] !== null && grid[ro][column] !== undefined) {
      invalidNumbers.add(grid[ro][column]);
    }
  }
  // Check Box Validity
  let rowI: number = Math.floor((row) / 2) * 2;
  let colI: number = Math.floor((column) / 3) * 3;
  for (let ro = rowI; ro < rowI + 2; ro++) {
    for (let col = colI; col < colI + 3; col++) {
      if (grid[ro][col] !== null && grid[ro][col] !== undefined) {
        invalidNumbers.add(grid[ro][col]);
      }
    }
  }

  // Convert set to array and filter from initial range
  return [1, 2, 3, 4, 5, 6].filter((num) => !invalidNumbers.has(num));
}

/** Maps a (row, column) coordinate to its 2x3 box index (0-5, left-to-right, top-to-bottom). */
function getMyBox(coordinate: Coordinate): number{
if (coordinate[0] < 2){
		if (coordinate[1] < 3){
			return 0;
		} else {
			return 1;
		}
	}
	else if (coordinate[0] < 4 ) {
		if (coordinate[1] < 3){
			return 2;
		} else {
			return 3;
		}
	}
	else if (coordinate[1] < 3){
		return 4;
	} else {
		return 5;
	}	
}

/** Returns all cell coordinates belonging to the same 2x3 box as the given coordinate. */
function getBoxCoordinates(coordinate: Coordinate): Coordinate[]{
	if (coordinate[0] < 2){
		if (coordinate[1] < 3){
			return [[0, 0], [0, 1], [0, 2],[1, 0], [1, 1], [1, 2]];
		} else {
			return [[0, 3], [0, 4], [0, 5],[1, 3], [1, 4], [1, 5]];
		}
	}
	else if (coordinate[0] < 4 ) {
		if (coordinate[1] < 3){
			return [[2, 0], [2, 1], [2, 2],[3, 0], [3, 1], [3, 2]];
		} else {
			return [[2, 3], [2, 4], [2, 5],[3, 3], [3, 4], [3, 5]];
		}
	}
	if (coordinate[1] < 3){
		return [[4, 0], [4, 1], [4, 2],[5, 0], [5, 1], [5, 2]];
	} else {
		return [[4, 3], [4, 4], [4, 5],[5, 3], [5, 4], [5, 5]];
	}	
}

/** Returns all cell coordinates for a 2x3 box by its index (0-5). */
function getBoxCoordinatesById(id: number): Coordinate[]{
	switch (id) {
		case 0:
			return [[0, 0], [0, 1], [0, 2],[1, 0], [1, 1], [1, 2]];
		case 1:
			return [[0, 3], [0, 4], [0, 5],[1, 3], [1, 4], [1, 5]];
		case 2:
			return [[2, 0], [2, 1], [2, 2],[3, 0], [3, 1], [3, 2]];
		case 3:
			return [[2, 3], [2, 4], [2, 5],[3, 3], [3, 4], [3, 5]];
		case 4:
			return [[4, 0], [4, 1], [4, 2],[5, 0], [5, 1], [5, 2]];
		case 5:
			return [[4, 3], [4, 4], [4, 5],[5, 3], [5, 4], [5, 5]];
		default: 
			return []
	}
}




/** Returns an integer in [min, max] using seeded or Math.random based on configuration. */
function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
	if (seedRngUsed){
		return Math.floor(rng() * (max - min + 1)) + min;
	} else {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}


/** Returns true when every puzzle cell matches the generated solution. */
export const isSolved = (game: SudokuGame): boolean => {
  if (game.solution[0][0] === null) return false;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      if (game.puzzle[row][col] !== game.solution[row][col]) return false;
    }
  }
  return true;
};

/** Reads the value at (row, column) from a 6x6 sudoku grid. */
export const getCell = (grid: Grid, row: number, col: number): number | null => {
  return grid[row][col];
};

/** Returns a new grid with the specified (row, column) cell updated immutably. */
export const setCell = (grid: Grid, row: number, col: number, value: number | null): Grid => {
  const next = grid.map((r) => [...r]);
  next[row][col] = value;
  return next;
};

/** Indicates whether a cell was not part of the initial puzzle and can be edited by the player. */
export const isCellEditable = (game: SudokuGame, row: number, col: number): boolean => {
  const cellValue = game.initialState[row][col];
  // Cell is editable if it was originally empty (null in initialState)
  return cellValue === null;
};