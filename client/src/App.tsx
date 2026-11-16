import { useEffect, useRef, useState, type MouseEvent } from "react";
import "./App.css";
import { SudokuGame, generatePuzzle, getCell, setCell, isSolved as isSudokuSolved, isCellEditable } from "./sudoku/SudokuLogic";
import {
  QueensGame,
  generatePuzzle as generateQueens,
  getCell as getQueensCell,
  isSolved as isQueensSolved,
} from "./queens/QueensLogic";

/** UI cell coordinate in row/column form. */
type Coordinate = { row: number; col: number };

/** Creates an empty square grid filled with nulls. */
const emptyGrid = (size: number) =>
  Array.from({ length: size }, () => Array<number | null>(size).fill(null));

/** Returns an empty 6x6 sudoku game state placeholder. */
const emptySudoku = (): SudokuGame => ({
  puzzle: emptyGrid(6),
  solution: emptyGrid(6),
  initialState: emptyGrid(6),
});

/** Returns an empty 8x8 queens game state placeholder. */
const emptyQueens = (): QueensGame => ({
  puzzle: emptyGrid(8),
  solution: emptyGrid(8),
});

/** Determines whether a queens cell is implicitly blocked by another placed queen. */
const isQueensAutoX = (
  grid: (number | null)[][],
  solution: (number | null)[][],
  row: number,
  col: number
): boolean => {
  for (let otherCol = 0; otherCol < 8; otherCol++) {
    if (otherCol !== col && getQueensCell(grid, row, otherCol) === 1) return true;
  }
  for (let otherRow = 0; otherRow < 8; otherRow++) {
    if (otherRow !== row && getQueensCell(grid, otherRow, col) === 1) return true;
  }
  for (const rowOffset of [-1, 1]) {
    for (const colOffset of [-1, 1]) {
      const otherRow = row + rowOffset;
      const otherCol = col + colOffset;
      if (
        otherRow >= 0 &&
        otherRow < 8 &&
        otherCol >= 0 &&
        otherCol < 8 &&
        getQueensCell(grid, otherRow, otherCol) === 1
      ) {
        return true;
      }
    }
  }

  const region = getQueensCell(solution, row, col);
  if (region !== null) {
    for (let otherRow = 0; otherRow < 8; otherRow++) {
      for (let otherCol = 0; otherCol < 8; otherCol++) {
        if (
          (otherRow !== row || otherCol !== col) &&
          getQueensCell(grid, otherRow, otherCol) === 1 &&
          getQueensCell(solution, otherRow, otherCol) === region
        ) {
          return true;
        }
      }
    }
  }

  return false;
};

/** Resolves the visible queens mark, preferring manual marks over inferred auto-X markers. */
const getQueensDisplayMark = (
  grid: (number | null)[][],
  solution: (number | null)[][],
  row: number,
  col: number
): number | null => {
  const manual = getQueensCell(grid, row, col);
  if (manual === 1) return 1;
  if (manual === 0) return null;
  if (manual === -1) return -1;
  return isQueensAutoX(grid, solution, row, col) ? -1 : null;
};

/** Root app component that manages active game state, puzzle data, and UI interactions. */
function App() {
  const [activeGame, setActiveGame] = useState<1 | 2>(1);
  const [selectedCell, setSelectedCell] = useState<Coordinate | null>(null);

  /** Guards to avoid duplicate puzzle generation under React StrictMode re-renders. */
  const sudokuGenerated = useRef(false);
  const queensGenerated = useRef(false);

  // --- Sudoku ---

  const [game, setGame] = useState<SudokuGame>(() => {
    if (sudokuGenerated.current) return emptySudoku();
    sudokuGenerated.current = true;
    return generatePuzzle();
  });

  /** Selects a sudoku cell for entry. */
  const handleSudokuCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  /** Writes a number into the selected editable sudoku cell. */
  const handleSudokuNumberClick = (num: number) => {
    if (selectedCell === null) return;
    if (activeGame !== 1) return;
    
    // Only allow editing cells that were originally empty (not pre-filled ones)
    if (!isCellEditable(game, selectedCell.row, selectedCell.col)) return;

    setGame((prev) => ({
      ...prev,
      puzzle: setCell(prev.puzzle, selectedCell.row, selectedCell.col, num),
    }));
  };

  /** Clears the selected editable sudoku cell. */
  const handleSudokuDeleteClick = () => {
    if (selectedCell === null) return;
    if (activeGame !== 1) return;
    
    // Only allow deleting cells that were originally empty (pre-filled cells cannot be deleted)
    if (!isCellEditable(game, selectedCell.row, selectedCell.col)) return;

    setGame((prev) => ({
      ...prev,
      puzzle: setCell(prev.puzzle, selectedCell.row, selectedCell.col, null),
    }));
  };

  /** Handles keyboard number entry and deletion for the active sudoku selection. */
  useEffect(() => {
    const handleSudokuKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        handleSudokuDeleteClick();
        return;
      }
      const num = Number(event.key);
      if (num >= 1 && num <= 6) {
        handleSudokuNumberClick(num);
      }
    };
    window.addEventListener("keydown", handleSudokuKeyDown);
    return () => window.removeEventListener("keydown", handleSudokuKeyDown);
  });

  // --- Queens ---

  const [queensGame, setQueensGame] = useState<QueensGame>(() => {
    if (queensGenerated.current) return emptyQueens();
    queensGenerated.current = true;
    return generateQueens();
  });

  /** Tracks drag-painting button state and context menu suppression for queens interactions. */
  const queensActiveMouseButton = useRef<number | null>(null);
  const queensSuppressContextMenu = useRef(false);
  /** Fixes the left-button drag gesture to either place or erase X marks for its duration. */
  const queensDragMode = useRef<"place" | "erase" | null>(null);

  /** Wires global mouse/context-menu listeners used for queens drag interactions. */
  useEffect(() => {
    const releaseMouse = () => {
      queensActiveMouseButton.current = null;
      queensDragMode.current = null;
    };
    const clearSuppressedContextMenu = () => {
      queensSuppressContextMenu.current = false;
    };
    const handleContextMenu = (event: globalThis.MouseEvent) => {
      if (queensSuppressContextMenu.current) {
        event.preventDefault();
        queensSuppressContextMenu.current = false;
      }
    };
    window.addEventListener("mousedown", clearSuppressedContextMenu, true);
    window.addEventListener("mouseup", releaseMouse);
    window.addEventListener("blur", releaseMouse);
    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("mousedown", clearSuppressedContextMenu, true);
      window.removeEventListener("mouseup", releaseMouse);
      window.removeEventListener("blur", releaseMouse);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  /** Selects a cell and applies queens mark placement using the active drag mode. */
  const handleQueensCellClick = (row: number, col: number, mark: number) => {
    setSelectedCell({ row, col });

    setQueensGame((prev) => {
      const next = prev.puzzle.map((column) => [...column]);
      const displayMark = getQueensDisplayMark(prev.puzzle, prev.solution, row, col);
      const autoMarked = isQueensAutoX(prev.puzzle, prev.solution, row, col);

      if (mark === 1) {
        if (displayMark === 1) {
          next[col][row] = null;
        } else {
          for (let otherCol = 0; otherCol < 8; otherCol++) {
            if (next[otherCol][row] === 1) next[otherCol][row] = null;
          }
          for (let otherRow = 0; otherRow < 8; otherRow++) {
            if (next[col][otherRow] === 1) next[col][otherRow] = null;
          }
          for (const rowOffset of [-1, 1]) {
            for (const colOffset of [-1, 1]) {
              const otherRow = row + rowOffset;
              const otherCol = col + colOffset;
              if (
                otherRow >= 0 &&
                otherRow < 8 &&
                otherCol >= 0 &&
                otherCol < 8 &&
                next[otherCol][otherRow] === 1
              ) {
                next[otherCol][otherRow] = null;
              }
            }
          }
          const region = getQueensCell(prev.solution, row, col);
          if (region !== null) {
            for (let otherRow = 0; otherRow < 8; otherRow++) {
              for (let otherCol = 0; otherCol < 8; otherCol++) {
                if (
                  next[otherCol][otherRow] === 1 &&
                  getQueensCell(prev.solution, otherRow, otherCol) === region
                ) {
                  next[otherCol][otherRow] = null;
                }
              }
            }
          }
          next[col][row] = 1;
        }
      } else if (mark === -1) {
        const mode = queensDragMode.current ?? (displayMark === -1 ? "erase" : "place");
        if (mode === "erase") {
          if (displayMark === -1) {
            next[col][row] = autoMarked ? 0 : null;
          }
        } else if (displayMark !== -1) {
          next[col][row] = -1;
        }
      }

      return { ...prev, puzzle: next };
    });
  };

  /** Prevents the browser context menu on queens cells. */
  const handleQueensContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  /** Starts queens mark painting based on mouse button and updates the target cell. */
  const handleQueensMouseDown = (row: number, col: number, event: MouseEvent) => {
    if (event.button !== 2 && event.button !== 0) return;
    queensActiveMouseButton.current = event.button;
    if (event.button === 0) {
      const displayMark = getQueensDisplayMark(queensGame.puzzle, queensGame.solution, row, col);
      queensDragMode.current = displayMark === -1 ? "erase" : "place";
      queensSuppressContextMenu.current = true;
    } else {
      queensDragMode.current = null;
    }
    handleQueensCellClick(row, col, event.button === 0 ? -1 : 1);
  };

  /** Continues queens mark painting while dragging over cells. */
  const handleQueensMouseEnter = (row: number, col: number) => {
    const button = queensActiveMouseButton.current;
    if (button === null) return;
    handleQueensCellClick(row, col, button === 0 ? -1 : 1);
  };

  const puzzleSolved = activeGame === 1 ? isSudokuSolved(game) : isQueensSolved(queensGame);


  
  return (
    <>
      <header className="header">
        <h1>Dailydle</h1>
      </header>
      <main className="outsidemain">
        <main className="main">
          {puzzleSolved && <div className="win-popup">Puzzle Solved</div>}
          <p className="game-title">{activeGame === 1 ? "Sudoku" : "Queens"}</p>
          <div className="gamebox">
            {activeGame === 1 && (
              <div className="sudoku-grid">
                {[...Array(6)].map((_, blockIndex) => {
                  const blockCol = blockIndex % 2;
                  const blockRow = Math.floor(blockIndex / 2);
                  return (
                    <div className="sudoku-block" key={blockIndex}>
                      {[...Array(6)].map((_, cellIndex) => {
                        const col = blockCol * 3 + (cellIndex % 3);
                        const row = blockRow * 2 + Math.floor(cellIndex / 3);
                        return (
                          <div
                            className={`sudoku-cell${
                              selectedCell?.row === row && selectedCell?.col === col
                                ? " selected"
                                : ""
                            }`}
                            key={cellIndex}
                            onClick={() => handleSudokuCellClick(row, col)}
                          >
                            {getCell(game.puzzle, row, col) ?? ""}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
            {activeGame === 2 && (
              <div className="queens-grid">
                {[...Array(8)].map((_, row) =>
                  [...Array(8)].map((_, col) => {
                    const regionId = getQueensCell(queensGame.solution, row, col);
                    const mark = getQueensDisplayMark(queensGame.puzzle, queensGame.solution, row, col);
                    return (
                      <div
                        className={`queens-cell region-${regionId}${
                          selectedCell?.row === row && selectedCell?.col === col
                            ? " selected"
                            : ""
                        }`}
                        key={`${row}-${col}`}
                        onMouseDown={(event) =>
                          handleQueensMouseDown(row, col, event)
                        }
                        onMouseEnter={() => handleQueensMouseEnter(row, col)}
                        onContextMenu={handleQueensContextMenu}
                      >
                        {mark === 1 ? (
                          <span className="mark-q">Q</span>
                        ) : mark === -1 ? (
                          <span className="mark-x">X</span>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
          {activeGame === 1 && (
            <div className="number-buttons">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  className={`number-button${selectedCell !== null ? "" : " disabled"}`}
                  onClick={() => handleSudokuNumberClick(num)}
                >
                  {num}
                </button>
              ))}
              <button
                className={`number-button${selectedCell !== null ? "" : " disabled"}`}
                onClick={handleSudokuDeleteClick}
              >
                ⌫
              </button>
            </div>
          )}
          <div className="game-buttons">
            <button onClick={() => setActiveGame(1)}>Sudoku</button>
            <button onClick={() => setActiveGame(2)}>Queens</button>
          </div>
        </main>
      </main>
    </>
  );
}

export default App;
