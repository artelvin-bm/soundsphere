import { useState } from "react";
import { api } from "./services/api";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");

  function showMessage(text) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  async function handleLogin(email, password) {
    try {
      const user = await api.login(email, password);
      setCurrentUser(user);
      showMessage("Login successful.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function handleRegister(name, email, password) {
    try {
      const user = await api.register(name, email, password);
      setCurrentUser(user);
      showMessage("Account created successfully.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  function handleLogout() {
    setCurrentUser(null);
  }

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        message={message}
      />
    );
  }

  return (
    <DashboardPage
      currentUser={currentUser}
      onLogout={handleLogout}
      message={message}
      showMessage={showMessage}
    />
  );
}

export default App;