import { useState, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import { service, errorMessage, DEMO } from "../services/api";
export default function Profile() {
  const { user, setUser, notify } = useApp();
  const [name, setName] = useState(user!.name),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await service.profile({ ...user!, name: name.trim() });
      setUser(updated);
      notify("Profile updated");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="page-section narrow">
      <span className="eyebrow muted">YOUR LITTLE CORNER</span>
      <h1>Your profile</h1>
      <form className="panel" onSubmit={submit}>
        <div className="avatar">{user!.name[0]}</div>
        {error && <p className="alert alert-danger">{error}</p>}
        <label className="field">
          Full name
          <input
            className="form-control"
            required
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field">
          Email
          <input className="form-control" value={user!.email} disabled />
        </label>
        <p>
          Account type:{" "}
          <strong>
            {user!.role === "ADMIN" ? "Administrator" : "Customer"}
          </strong>
        </p>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
        {DEMO && (
          <p className="small text-secondary mt-3 mb-0">
            Demo information is stored in this browser. Use fictional details.
          </p>
        )}
      </form>
    </section>
  );
}
