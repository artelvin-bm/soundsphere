import { useEffect, useState } from "react";
import { api } from "./services/api";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("soundsphere_current_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("soundsphere_theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("soundsphere_theme", theme);
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
      localStorage.setItem("soundsphere_current_user", JSON.stringify(user));
      showMessage("Login successful.")
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function handleRegister(name, email, password) {
    try {
      const user = await api.register(name, email, password);
      setCurrentUser(user);
      localStorage.setItem("soundsphere_current_user", JSON.stringify(user));
      showMessage("Account created successfully.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("soundsphere_current_user");
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