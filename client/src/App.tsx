import { useState } from "react";
import "./App.css";
import { Grid, createEmptyGrid, getCell, setCell } from "./SudokuLogic";

function App() {
  const [activeGame, setActiveGame] = useState<1 | 2>(1);
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);

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
                            className="sudoku-cell"
                            key={cellIndex}
                            onClick={() => {
                              const next = (getCell(grid, row, col) ?? 0) % 6 + 1;
                              setGrid(setCell(grid, row, col, next));
                            }}
                          >
                            {getCell(grid, row, col) ?? ""}
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
