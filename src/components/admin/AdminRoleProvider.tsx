"use client";
import { createContext, useContext } from "react";

type AdminRole = "ADMIN" | "EDITOR" | "AUTHOR";
const AdminRoleContext = createContext<AdminRole>("ADMIN");

export function AdminRoleProvider({ role, children }: { role: AdminRole; children: React.ReactNode }) {
  return <AdminRoleContext.Provider value={role}>{children}</AdminRoleContext.Provider>;
}

export function useAdminRole() {
  return useContext(AdminRoleContext);
}
