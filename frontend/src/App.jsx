import { useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Home from "./Home";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showLogin, setShowLogin] = useState(true);
  const [showHome, setShowHome] = useState(true);

  const [token, setToken] = useState(null);

  const handleLogin = (receivedToken) => {
    setToken(receivedToken);
  };

  const handleLogout = () => {
    setToken(null);
    setShowLogin(true);
  };

  const addTask = () => {
    if (task.trim() === "") return;

    setTasks([...tasks, task]);
    setTask("");
  };


  return (
    <div className="app">
      {token ? (
        <Dashboard
          token={token}
          onLogout={handleLogout} />
      ) : showHome ? (
        <Home
          onLoginClick={() => {
            setShowHome(false);
            setShowLogin(true);
          }}
          onGetStarted={() => {
            setShowHome(false);
            setShowLogin(false);
          }}
        />
      ) : showLogin ? (
        <Login onLogin={handleLogin}
          onCreateAccount={() => setShowLogin(false)} />
      ) : (
        <Register />
      )}

    </div>
  );
};
export default App;