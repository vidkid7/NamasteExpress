import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import { AdminRoleProvider } from "@/components/admin/AdminRoleProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { error, session } = await requireRole(["ADMIN", "EDITOR", "AUTHOR"]);

  if (error === "unauthorized") {
    redirect("/auth/login");
  }

  if (error === "forbidden") {
    redirect("/");
  }

  return (
    <AdminRoleProvider role={session!.user.role as "ADMIN" | "EDITOR" | "AUTHOR"}>
      <AdminThemeProvider>
        <div className="flex min-h-screen overflow-x-hidden" style={{ background: "var(--background)", color: "var(--foreground)" }}>
          <AdminSidebar />
          <main className="flex-1 min-w-0 overflow-auto">
            <div className="mx-auto max-w-7xl px-4 pb-6 pt-20 sm:px-6 md:p-8 md:pt-8">
              {children}
            </div>
          </main>
        </div>
      </AdminThemeProvider>
    </AdminRoleProvider>
  );
}
