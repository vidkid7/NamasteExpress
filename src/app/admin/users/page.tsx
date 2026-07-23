import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { AdminUserRoleSelect } from "@/components/admin/AdminUserRoleSelect";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { error, session } = await requireRole(["ADMIN"]);

  // Only ADMIN can access this page
  if (error) {
    const adminSecret = process.env.ADMIN_SECRET_PATH || "admin";
    redirect(adminSecret === "admin" ? "/admin" : "/" + adminSecret);
  }

  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Name</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Email</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Role</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Active</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-3 font-medium">{user.name || "—"}</td>
                <td className="p-3" style={{ color: "var(--muted)" }}>{user.email}</td>
                <td className="p-3">
                  <AdminUserRoleSelect
                    userId={user.id}
                    currentRole={user.role}
                    isSelf={user.id === session?.user.id}
                  />
                </td>
                <td className="p-3">
                  <span
                    className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
                    style={{
                      background: user.is_active ? "#16a34a" : "#6b7280",
                      color: "#fff",
                    }}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>
                  {user.created_at.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center" style={{ color: "var(--muted)" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
