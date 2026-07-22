import seedrandom from 'seedrandom';
const rng = seedrandom('mySeed');
const seedRngUsed: boolean = false;

export type Grid = (number | null)[][];
type Coordinate = [row: number, column: number];
const BaseNumbers: number[] = [1, 2, 3, 4, 5, 6]

export function createEmptyGrid(): Grid {
  	const Grid = Array.from({ length: 6 }, () => Array(6).fill(null));
	for (let i = 0; i < 6; i++) {
		for (let j = 0; j < 6; j++) {
			let validNumberArray: number[] = getValidNextNumber(Grid, i, j)
			if (validNumberArray.length !== 0) {
				let nextNumberId: number = getRandomInt(0, validNumberArray.length - 1);
				Grid[i][j] = validNumberArray[nextNumberId];
			}
		}
	}

	let success = doCorrectionAlgorithm(Grid);
  	if (success) {
		// write DoubleCheck method
	}

  	return Grid;
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
				console.log(i+1 + "   " + j+1)
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
		console.log("nothing broken")
		return true;
	}
	
	
	console.log(emptyNumbers.toString() + "lets fix this")

	let missingNumbers: number[] = []; // missing numbers by box logic

	if (emptyNumbers.length === 4) {
		for (let int = 1; int < 7; int++) {
			let amountNum = amountMap.get(int);
			if (amountNum === 5) {
				missingNumbers.push(int);
			}
		}
	} else {
		console.log("big break")
		createEmptyGrid(); //redo
		return false;
	}

	console.log(missingNumbers.toString())

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

	console.log(boxToFlip + "flipped")

	getBoxCoordinatesById(boxToFlip).forEach(element => {
		if (grid[element[0]][element[1]] === missingNumbers[0]) {
			grid[element[0]][element[1]] = missingNumbers[1];
			console.log(grid[element[0]][element[1]] + " + " + missingNumbers[0])
		} else if (grid[element[0]][element[1]] === missingNumbers[1]) {
			grid[element[0]][element[1]] = missingNumbers[0];
			console.log(grid[element[0]][element[1]] + " + " + missingNumbers[1])
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
	if (coordinate[1] < 3){
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

//Create Full Board, remove one cell and check whether there is another solution
	//pick new possible content for the removed cell, and try to complete it 
		//when choosing new cell content, check for basic conditions (row, column, 3x3)
	//skip first 9 removed cells, should always be completable without them
		//try skipping more than 9, does 25 work for example
	//remember which cells are not allowed to be removed because they allow multiple solutions
	//idea: remove multiple cells simultaneously
	//to fill in cells, look for row, column, 3x3 which have a lot of entries
	

/** 
	if (emptyNumbers.length === 4) {
		for (let emp = 0; emp < 2; emp++) {
			let foundNumbersInBox: number[] = [];

			let boxCoords = getBoxCoordinates([emptyNumbers[emp*2],emptyNumbers[emp*2+1]])
			boxCoords.forEach(coord => {
				foundNumbersInBox.push(grid[coord[0]][coord[1]] ?? 0)
			});
			console.log(foundNumbersInBox.toString())
			
			const missingNumber: number[] = BaseNumbers.filter(function (num) {
				return !foundNumbersInBox.includes(num)
			});
			console.log(missingNumber.toString())
			missingNumbers.push(missingNumber.pop()!);
		}
	} else {
		console.log("big break")
		createEmptyGrid(); //redo
		return false;
	}
		*/