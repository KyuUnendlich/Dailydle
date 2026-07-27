import seedrandom from 'seedrandom';
const rng = seedrandom('mySeed');
const seedRngUsed: boolean = false;

export type Grid = (number | null)[][];
type Coordinate = [row: number, column: number];
const BaseNumbers: number[] = [1, 2, 3, 4, 5, 6]

let fillAmountRows: number[] = new Array(6);
let fillAmountColumns: number[] = new Array(6);
let fillAmountBoxes: number[] = new Array(6);
let emptyCells: number = 0;


export function createEmptyGrid(): Grid {
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
				console.log("Grid correct")

				const clearedCells: boolean[][] = Array.from({ length: 6 }, () => Array(6).fill(false));

				for (let i = 0; i < 25; i++){
					let clearRowId: number = getRandomInt(0, 5);
					let clearColumnId: number = getRandomInt(0, 5);

					if (clearedCells[clearRowId][clearColumnId] === true) {
						let rng01: number = getRandomInt(0, 1);
						console.log("FAILED Tried to remove cell again "+ clearRowId + " " + clearColumnId)
						i -= rng01; // Try again sometimes
					} else {

						let grid_copy = structuredClone(grid);

						grid[clearRowId][clearColumnId] = null;
						console.log("Tried to remove cell "+ clearRowId + " " + clearColumnId)
						emptyCells++;
						
						if (!CheckIfOneSolution(grid, emptyCells)){
							grid = grid_copy;
							emptyCells--;
						} else {
							grid = grid_copy;
							grid[clearRowId][clearColumnId] = null;
						}

						clearedCells[clearRowId][clearColumnId] = true;

					}
				}
				return grid;
			}
		}
	}
}

function CheckIfOneSolution(grid: Grid, emptyCellsLocal: number): boolean {

	fillAmountRows = new Array(6).fill(0);
	fillAmountColumns = new Array(6).fill(0);
	fillAmountBoxes = new Array(6).fill(0);

	for (let i = 0; i < 6; i++) {
		for (let j = 0; j < 6; j++) {
			if (grid[i][j] !== null) {
				fillAmountRows[i]++;
				fillAmountColumns[j]++;
			}
		}
		getBoxCoordinatesById(i).forEach(element => {
			if (grid[element[0]][element[1]] !== null) {
				fillAmountBoxes[i]++;
			}
		});
	}

	while (emptyCellsLocal > 0) {
		if (FillNextPossibleCell(grid)) {
			emptyCellsLocal--;
			console.log("Cell filled, cells still empty: " + emptyCellsLocal)
		} else {
			console.log("Found Duplicate Solution")
			return false;
		}
	}
	console.log("Cell successfully removed")
	return true;
}

function FillNextPossibleCell(grid: Grid): boolean{
	for (let i = 0; i < fillAmountRows.length; i++) {
		if (fillAmountRows[i] === 5) {
			let allPossiblenumbers: number[] = [1, 2, 3, 4, 5, 6];
			let missingNumber: number = -1;
			//Find Missing Number
			for (let j = 0; j < 6; j++) {
				if (grid[i][j] !== null) {
					allPossiblenumbers = allPossiblenumbers.filter(item => item !== grid[i][j])
				} else {
					missingNumber = j
				}
			}
			//Set Number and correct the grid
			grid[i][missingNumber] = allPossiblenumbers[0];
			fillAmountRows[i]++;
			fillAmountColumns[missingNumber]++;
			fillAmountBoxes[getMyBox([i,missingNumber])]++;
			return true;
		}
	}

	for (let i = 0; i < fillAmountColumns.length; i++) {
		if (fillAmountColumns[i] === 5) {
			let allPossiblenumbers: number[] = [1, 2, 3, 4, 5, 6];
			let missingNumber: number = -1;
			for (let j = 0; j < 6; j++) {
				if (grid[j][i] !== null) {
					allPossiblenumbers = allPossiblenumbers.filter(item => item !== grid[j][i])
				} else {
					missingNumber = j
				}
			}
			grid[missingNumber][i] = allPossiblenumbers[0];
			fillAmountRows[missingNumber]++;
			fillAmountColumns[i]++;
			fillAmountBoxes[getMyBox([missingNumber,i])]++;
			return true;
		}
	}

	for (let i = 0; i < fillAmountBoxes.length; i++) {
		if (fillAmountBoxes[i] === 5) {
			let allPossiblenumbers: number[] = [1, 2, 3, 4, 5, 6];
			let boxArray = getBoxCoordinatesById(i);

			let missingNumber: number = -1;
			for (let j = 0; j < 6; j++) {
				if (grid[boxArray[j][0]][boxArray[j][1]] !== null) {
					allPossiblenumbers = allPossiblenumbers.filter(item => item !== grid[boxArray[j][0]][boxArray[j][1]])
				} else {
					missingNumber = j
				}
			}
			grid[boxArray[missingNumber][0]][boxArray[missingNumber][1]] = allPossiblenumbers[0];
			fillAmountRows[boxArray[missingNumber][0]]++;
			fillAmountColumns[boxArray[missingNumber][1]]++;
			fillAmountBoxes[i]++;
			return true;
		}
	}
	return false;
}

	function old(grid: Grid) {


	//Global Structure that tracks row / column / box fill state, maybe a stable structure, 
	//algorithm that prioritiues choosing a row of 5 to fill, leaving only multi options at the end
	// think about what the exit condition is / debug early with examples
	while (emptyCells >= 0) {	
		for (let i = 0; i < 6; i++) {
		let amountRow: number = 0
		let amountColumn: number = 0
		let amountBox: number = 0

		for (let j = 0; j < 6; j++) {
			let missingNumbersID: number[] = new Array(6).fill(99); // Save the value of the row / column cell
			if (grid[i][j] !== null){
				amountRow++;
			} else {
				missingNumbersID[j] = grid[i][j]!; // Saves number X (grid[i][j]) from column j
			}

			if (amountRow === 5){
				missingNumbersID.forEach((element, k) => {
					if (element !== 99) {
						//grid[i][k] = element[k];
					}
				});
			}
		}

		getBoxCoordinatesById(i).forEach(element => {
			amountBox += grid[element[0]][element[1]] ?? 0;
		});

		}
	}
	return true;
}

function CheckGrid(grid: Grid): boolean {
	// Lazy Checker (this should catch everything, right?)
	let correctness = true;
	for (let i = 0; i < 6; i++) {
		let amountRow: number = 0
		let amountColumn: number = 0
		let amountBox: number = 0

		for (let j = 0; j < 6; j++) {
			if (grid[i][j] !== null){
				amountRow += grid[i][j] ?? 0;
				amountColumn += grid[j][i] ?? 0;
			}
		}

		getBoxCoordinatesById(i).forEach(element => {
			amountBox += grid[element[0]][element[1]] ?? 0;
		});

		if (amountRow !== 21 || amountColumn !== 21 || amountBox !== 21){
			correctness = false;
		}
	}
	return correctness
}



function doCorrectionAlgorithm(grid: Grid): boolean {
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
				//console.log(i+1 + "   " + j+1)
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
		//console.log("nothing broken")
		return true;
	}
	
	
	//console.log(emptyNumbers.toString() + "lets fix this")

	let missingNumbers: number[] = []; // missing numbers by box logic

	if (emptyNumbers.length === 4) {
		for (let int = 1; int < 7; int++) {
			let amountNum = amountMap.get(int);
			if (amountNum === 5) {
				missingNumbers.push(int);
			}
		}
	} else {
		//console.log("big break")
		return false;
	}

	//console.log(missingNumbers.toString())

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

	//console.log(boxToFlip + "flipped")

	getBoxCoordinatesById(boxToFlip).forEach(element => {
		if (grid[element[0]][element[1]] === missingNumbers[0]) {
			grid[element[0]][element[1]] = missingNumbers[1];
			//console.log(grid[element[0]][element[1]] + " + " + missingNumbers[0])
		} else if (grid[element[0]][element[1]] === missingNumbers[1]) {
			grid[element[0]][element[1]] = missingNumbers[0];
			//console.log(grid[element[0]][element[1]] + " + " + missingNumbers[1])
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

function getValidNextNumber(grid: Grid, row: number, column: number): number[] {
	let allPossiblenumbers: number[] = [1, 2, 3, 4, 5, 6];

	for (let num = 1; num < 7; num++) {
		//Check Row Validity
		for (let col = 0; col < 6; col++) {
			if (grid[row][col] === num){
				allPossiblenumbers = allPossiblenumbers.filter((number) => number !== num)
			}
		}
		//Check Column Validity
		for (let ro = 0; ro < 6; ro++) {
			if (grid[ro][column] === num){
				allPossiblenumbers = allPossiblenumbers.filter((number) => number !== num)
			}
		}
		//Get Initial TopLeft Index of Box
		let rowI: number = Math.floor((row) / 2) * 2
		let colI: number = Math.floor((column) / 3) * 3
		//Check Box Validity
		for (let ro = rowI; ro < rowI + 2; ro++) {
			for (let col = colI; col < colI + 3; col++) {
				if (grid[ro][col] === num){
					allPossiblenumbers = allPossiblenumbers.filter((number) => number !== num)
				}
			}
		}
	}
	return allPossiblenumbers;
}

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