import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { service, DEMO, errorMessage } from "../services/api";
import { useApp } from "../context/AppContext";
export default function Auth({ signup = false }: { signup?: boolean }) {
  const { setUser } = useApp(),
    navigate = useNavigate(),
    location = useLocation();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (signup && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      if (signup)
        await service.signup(name.trim(), email.toLowerCase().trim(), password);
      const u = await service.login(email.toLowerCase().trim(), password);
      setUser(u);
      navigate(location.state?.from || "/");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-wrap">
      <div className="auth-story">
        <span className="eyebrow">YOUR TABLE IS READY</span>
        <h1>
          A good meal
          <br />
          starts here.
        </h1>
        <p>All your favourites, just a few clicks away.</p>
        <div className="auth-decoration">c.</div>
      </div>
      <div className="auth-form">
        <span className="eyebrow muted">CEYLON BITES</span>
        <h2>{signup ? "Join the table" : "Welcome back"}</h2>
        <p>
          {signup
            ? "Create your account and find your next favourite."
            : "Sign in to order something delicious."}
        </p>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={submit}>
          {signup && (
            <label className="field">
              Full name
              <input
                className="form-control"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}
          <label className="field">
            Email address
            <input
              className="form-control"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="field">
            Password
            <input
              className="form-control"
              type="password"
              minLength={signup ? 8 : 1}
              maxLength={72}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={signup ? "new-password" : "current-password"}
            />
            {signup && <small>Use 8–72 characters.</small>}
          </label>
          {signup && (
            <label className="field">
              Confirm password
              <input
                className="form-control"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          )}
          <button className="btn btn-primary w-100" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </button>
        </form>
        <p className="mt-4">
          {signup ? "Already have an account?" : "New to Ceylon Bites?"}{" "}
          <Link to={signup ? "/sign-in" : "/sign-up"}>
            {signup ? "Sign in" : "Create account"}
          </Link>
        </p>
        {DEMO && !signup && (
          <div className="demo-login">
            <strong>Try the coursework demo</strong>
            <p>
              Password for both accounts: <code>Demo123!</code>
            </p>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setEmail("customer@demo.test");
                setPassword("Demo123!");
              }}
            >
              Fill customer login
            </button>{" "}
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setEmail("admin@demo.test");
                setPassword("Demo123!");
              }}
            >
              Fill admin login
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
