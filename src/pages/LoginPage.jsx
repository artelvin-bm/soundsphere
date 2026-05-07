import { useState } from "react";
import { Music } from "lucide-react";

function LoginPage({ onLogin, onRegister, message }) {
  const [form, setForm] = useState({
    name: "",
    email: "demo@soundsphere.test",
    password: "password123",
  });

  function updateField(field, value) {
    setForm({
      ...form,
      [field]: value,
    });
  }

  function submitLogin(event) {
    event.preventDefault();
    onLogin(form.email, form.password);
  }

  function submitRegister(event) {
    event.preventDefault();
    onRegister(form.name, form.email, form.password);
  }

  return (
    <main className="login-page">
      <section className="hero-panel">
        <div className="logo-box">
          <Music size={38} />
        </div>

        <h1>SoundSphere</h1>
        <p>
          A web-based music collaboration and production management prototype
          for managing projects, audio files, and production tasks.
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
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
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
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
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