"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  userName: string | null;
  isSelf: boolean;
}

export function AdminDeleteUserButton({ userId, userName, isSelf }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm(`Delete ${userName || "this user"}? This cannot be undone.`)) return;

    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to delete user");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to delete user. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isSelf) {
    return <span className="text-xs text-muted">Current account</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded px-2 py-1 text-xs font-medium disabled:opacity-50"
        style={{ background: "#dc2626", color: "#fff" }}
      >
        {loading ? "Deleting…" : "Delete"}
      </button>
      {error && <span className="text-xs text-error" role="alert">{error}</span>}
    </div>
  );
}
