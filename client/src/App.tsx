import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setMessage(data.status))
      .catch(() => setMessage("Could not reach server"));
  }, []);

  return (
    <div>
      <h1>Dailydle</h1>
      <p>Server status: {message || "loading..."}</p>
    </div>
  );
}

export default App;
