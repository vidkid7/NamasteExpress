"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  commentId: string;
  currentStatus: string;
}

export function AdminCommentActions({ commentId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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

  if (loading) {
    return <span className="text-xs" style={{ color: "var(--muted)" }}>Updating...</span>;
  }

  return (
    <div className="flex gap-1">
      {currentStatus !== "APPROVED" && (
        <button
          onClick={() => updateStatus("APPROVED")}
          className="px-2 py-1 text-xs rounded font-medium"
          style={{ background: "#16a34a", color: "#fff" }}
        >
          Approve
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          onClick={() => updateStatus("REJECTED")}
          className="px-2 py-1 text-xs rounded font-medium"
          style={{ background: "#dc2626", color: "#fff" }}
        >
          Reject
        </button>
      )}
    </div>
  );
}
