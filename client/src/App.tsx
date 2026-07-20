import { useState } from "react";
import "./App.css";

function App() {
  const [activeGame, setActiveGame] = useState<1 | 2>(1);

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
                {[...Array(6)].map((_, blockIndex) => (
                  <div className="sudoku-block" key={blockIndex}>
                    {[...Array(6)].map((_, cellIndex) => (
                      <div className="sudoku-cell" key={cellIndex}></div>
                    ))}
                  </div>
                ))}
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
