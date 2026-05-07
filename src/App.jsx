import { useEffect, useState } from "react";
import { api } from "./services/api";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }

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
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <DashboardPage
      currentUser={currentUser}
      onLogout={handleLogout}
      message={message}
      showMessage={showMessage}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

export default App;