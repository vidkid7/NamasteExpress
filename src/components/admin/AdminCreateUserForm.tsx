"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const roles = ["READER", "AUTHOR", "EDITOR", "ADMIN"] as const;

export function AdminCreateUserForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("READER");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create user");
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      setRole("READER");
      setMessage("User created successfully.");
      router.refresh();
    } catch {
      setError("Unable to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Add User</h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Create a login account and choose its access level.
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-md p-3 text-sm bg-success-light text-success" role="status">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md p-3 text-sm bg-error-light text-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="admin-user-name" className="block text-sm font-medium mb-1">Name</label>
          <input
            id="admin-user-name"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={120}
            required
          />
        </div>
        <div>
          <label htmlFor="admin-user-email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="admin-user-email"
            type="email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            required
          />
        </div>
        <div>
          <label htmlFor="admin-user-password" className="block text-sm font-medium mb-1">Temporary password</label>
          <input
            id="admin-user-password"
            type="password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            required
          />
        </div>
        <div>
          <label htmlFor="admin-user-role" className="block text-sm font-medium mb-1">Role</label>
          <select
            id="admin-user-role"
            className="input"
            value={role}
            onChange={(event) => setRole(event.target.value as (typeof roles)[number])}
          >
            {roles.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating…" : "Add User"}
          </button>
        </div>
      </form>
    </section>
  );
}
