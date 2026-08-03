import { useEffect, useState } from "react";
import "./App.css";
import { SudokuGame, createEmptyGrid, getCell, setCell } from "./SudokuLogic";

type Coordinate = { row: number; col: number };

function App() {
  const [activeGame, setActiveGame] = useState<1 | 2>(1);
  const [game, setGame] = useState<SudokuGame>(createEmptyGrid);
  const [selectedCell, setSelectedCell] = useState<Coordinate | null>(null);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleNumberClick = (num: number) => {
    if (selectedCell === null) return;
    setGame((prev) => ({
      ...prev,
      puzzle: setCell(prev.puzzle, selectedCell.row, selectedCell.col, num),
    }));
  };

  const handleDeleteClick = () => {
    if (selectedCell === null) return;
    setGame((prev) => ({
      ...prev,
      puzzle: setCell(prev.puzzle, selectedCell.row, selectedCell.col, null),
    }));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        handleDeleteClick();
        return;
      }
      const num = Number(event.key);
      if (num >= 1 && num <= 6) {
        handleNumberClick(num);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <>
      <header className="header">
        <h1>Dailydle</h1>
      </header>
      <main className="outsidemain">
        <main className="main">
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
                            onClick={() => handleCellClick(row, col)}
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
            {activeGame === 2 && <div className="queens-grid"></div>}
          </div>
          {activeGame === 1 && (
            <div className="number-buttons">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  className={`number-button${selectedCell !== null ? "" : " disabled"}`}
                  onClick={() => handleNumberClick(num)}
                >
                  {num}
                </button>
              ))}
              <button
                className={`number-button${selectedCell !== null ? "" : " disabled"}`}
                onClick={handleDeleteClick}
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
