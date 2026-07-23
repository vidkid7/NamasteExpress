"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}

const roles = ["READER", "AUTHOR", "EDITOR", "ADMIN"];

export function AdminUserRoleSelect({ userId, currentRole, isSelf }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(newRole: string) {
    if (newRole === currentRole) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  if (isSelf) {
    return (
      <span
        className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        {currentRole}
      </span>
    );
  }

  return (
    <select
      value={currentRole}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="px-2 py-1 rounded text-xs font-medium"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        color: "var(--foreground)",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {roles.map((role) => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  );
}
