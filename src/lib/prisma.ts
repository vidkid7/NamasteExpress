import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildDatasourceUrl() {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return undefined;
  if (baseUrl.includes("connection_limit=")) return baseUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  // In development, cap the pool size so a heavily parallel homepage does not
  // overwhelm a remote or resource-constrained PostgreSQL server.
  if (process.env.NODE_ENV === "development") {
    return `${baseUrl}${separator}connection_limit=5&pool_timeout=30&connect_timeout=30`;
  }
  return baseUrl;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
