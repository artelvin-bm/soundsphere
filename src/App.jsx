import { useState } from "react";
import { loadData, saveData } from "./utils/storage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const [data, setData] = useState(loadData);
  const [currentUser, setCurrentUser] = useState(data.users[0]);
  const [message, setMessage] = useState("");

  function updateData(newData) {
    setData(newData);
    saveData(newData);
  }

  function showMessage(text) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  function handleLogin(email, password) {
    const user = data.users.find(
      (item) => item.email === email && item.password === password
    );

    if (!user) {
      showMessage("Invalid email or password.");
      return;
    }

    setCurrentUser(user);
    showMessage("Login successful.");
  }

  function handleRegister(name, email, password) {
    if (!name.trim() || !email.trim() || password.length < 6) {
      showMessage("Please complete all fields. Password must be at least 6 characters.");
      return;
    }

    const emailExists = data.users.some((user) => user.email === email);

    if (emailExists) {
      showMessage("That email is already registered.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
    };

    const newData = {
      ...data,
      users: [...data.users, newUser],
    };

    updateData(newData);
    setCurrentUser(newUser);
    showMessage("Account created successfully.");
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
      data={data}
      currentUser={currentUser}
      updateData={updateData}
      onLogout={handleLogout}
      message={message}
      showMessage={showMessage}
    />
  );
}

export default App;