"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import BrandIcon from "../components/BrandIcon";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", price: "", currency: "EUR", day: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchSubs();
    }
  }, [status]);

  async function fetchSubs() {
    setLoading(true);
    const res = await fetch("/api/subscriptions");
    const data = await res.json();
    setSubs(data.subscriptions || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Something went wrong");
    } else {
      setForm({ name: "", price: "", currency: "EUR", day: "" });
      await fetchSubs();
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    await fetchSubs();
  }

  if (status === "loading") {
    return (
      <main className="container">
        <p>Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="container">
        <p>Please sign in first.</p>
        <button className="btn" onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Your subscriptions</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="name-row">
          <BrandIcon name={form.name} size={28} />
          <input
            placeholder="Name (e.g. Netflix)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <input
          placeholder="Price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <select
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
        >
          <option>EUR</option>
          <option>USD</option>
          <option>GBP</option>
        </select>
        <input
          placeholder="Billing day of month (1-31)"
          type="number"
          min="1"
          max="31"
          value={form.day}
          onChange={(e) => setForm({ ...form, day: e.target.value })}
          required
        />
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Adding..." : "Add subscription"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading subscriptions...</p>
      ) : subs.length === 0 ? (
        <p>No subscriptions yet. Add one above.</p>
      ) : (
        <ul className="list">
          {subs.map((s) => (
            <li key={s.id}>
              <span className="sub-info">
                <BrandIcon name={s.name} size={36} />
                <span className="sub-text">
                  <strong>{s.name}</strong>
                  <br />
                  <small>
                    {s.currency} {s.price}
                    {s.day ? ` · billed on the ${s.day}${ordinalSuffix(s.day)}` : ""}
                  </small>
                </span>
              </span>
              <button className="btn secondary" onClick={() => handleDelete(s.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function ordinalSuffix(day) {
  const n = Number(day);
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}
