import { prisma } from "@/lib/prisma";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "SETTINGS_CHANGE";

interface AuditLogParams {
  adminId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
}

// Sensitive fields that should never be stored in audit logs
const SENSITIVE_FIELDS = ["password_hash", "totp_secret", "token_hash", "access_token", "refresh_token"];

function sanitizeValue(value: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!value) return undefined;
  const sanitized = { ...value };
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }
  return sanitized;
}

export async function auditLog({
  adminId,
  action,
  entity,
  entityId,
  oldValue,
  newValue,
  ipAddress,
}: AuditLogParams) {
  return prisma.auditLog.create({
    data: {
      admin_id: adminId,
      action,
      entity,
      entity_id: entityId,
      old_value: sanitizeValue(oldValue) as object | undefined,
      new_value: sanitizeValue(newValue) as object | undefined,
      ip_address: ipAddress,
    },
  });
}
