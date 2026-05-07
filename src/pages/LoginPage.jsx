import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import logo from "../assets/logo.png";

function LoginPage({ onLogin, onRegister, message, theme, onToggleTheme }) {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function updateLoginField(field, value) {
    setLoginForm({
      ...loginForm,
      [field]: value,
    });
  }

  function updateRegisterField(field, value) {
    setRegisterForm({
      ...registerForm,
      [field]: value,
    });
  }

  function submitLogin(event) {
    event.preventDefault();
    onLogin(loginForm.email, loginForm.password);
  }

  function submitRegister(event) {
    event.preventDefault();
    onRegister(
      registerForm.name,
      registerForm.email,
      registerForm.password
    );
  }

  return (
    <main className="login-page">
      <button
        type="button"
        className="theme-toggle login-theme-toggle"
        onClick={onToggleTheme}
        aria-label="Toggle color theme"
      >
        {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
        <span>{theme === "light" ? "Light" : "Dark"}</span>
      </button>

      <section className="hero-panel">
        <div className="login-logo-wrap">
          <img src={logo} alt="SoundSphere logo" className="login-logo" />
        </div>

        <h1>SoundSphere</h1>
        <p>
          Manage music projects, organize audio file versions, assign production
          tasks, and track collaboration progress in one workspace.
        </p>

        <div className="quality-box">
          <h2>Prototype Scope</h2>
          <ul>
            <li>User login and registration</li>
            <li>Music project management</li>
            <li>Audio file upload validation</li>
            <li>Task assignment and progress tracking</li>
          </ul>
        </div>
      </section>

      <section className="auth-panel">
        <h2>Login</h2>

        <form onSubmit={submitLogin} className="form">
          <label>Email</label>
          <input
            type="email"
            value={loginForm.email}
            onChange={(event) =>
              updateLoginField("email", event.target.value)
            }
          />

          <label>Password</label>
          <input
            type="password"
            value={loginForm.password}
            onChange={(event) =>
              updateLoginField("password", event.target.value)
            }
          />

          <button type="submit" className="primary-button">
            Login
          </button>
        </form>

        <p className="hint">Demo: demo@soundsphere.test / password123</p>

        <div className="divider" />

        <h2>Create Account</h2>

        <form onSubmit={submitRegister} className="form">
          <label>Display Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={registerForm.name}
            onChange={(event) =>
              updateRegisterField("name", event.target.value)
            }
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={registerForm.email}
            onChange={(event) =>
              updateRegisterField("email", event.target.value)
            }
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={registerForm.password}
            onChange={(event) =>
              updateRegisterField("password", event.target.value)
            }
          />

          <button type="submit" className="secondary-button">
            Register
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </section>
    </main>
  );
}

export default LoginPage;