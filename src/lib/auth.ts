import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, isKnownSeedPassword } from "@/lib/security";
import type { UserRole } from "@prisma/client";

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX = 10;
const ACCOUNT_LOCK_WINDOW_MS = 15 * 60 * 1000;
const ACCOUNT_LOCK_MAX_FAILURES = 5;
const DUMMY_PASSWORD_HASH =
  "$2b$12$rN6gn4q1MqAelqfkLKKqnOK6sqY8Sr74jkLLzbVcdOU8xjs9d7Bvm";
const googleAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      email_verified: Date | null;
      session_version: number;
    };
  }
  interface User {
    role: UserRole;
    emailVerified: Date | null;
    session_version: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    email_verified: Date | null;
    session_version: number;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt", maxAge: 12 * 60 * 60, updateAge: 60 * 60 },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    ...(googleAuthEnabled
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse({
          email: String(credentials?.email ?? ""),
          password: String(credentials?.password ?? ""),
        });

        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ip = request ? getClientIp(request) : "unknown";
        const rateLimit = checkRateLimit(
          `credentials:${ip}:${email}`,
          LOGIN_RATE_LIMIT_MAX,
          LOGIN_RATE_LIMIT_WINDOW_MS
        );
        if (!rateLimit.allowed) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password_hash || !user.is_active) {
            await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
            return null;
          }

          if (user.locked_until && user.locked_until > new Date()) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password_hash);
          if (!isValid) {
            const lastFailureWasRecent =
              user.last_failed_login_at &&
              Date.now() - user.last_failed_login_at.getTime() < ACCOUNT_LOCK_WINDOW_MS;
            const nextFailureCount = (lastFailureWasRecent ? user.failed_login_count : 0) + 1;
            const shouldLock = nextFailureCount >= ACCOUNT_LOCK_MAX_FAILURES;

            await prisma.user.update({
              where: { id: user.id },
              data: {
                failed_login_count: nextFailureCount,
                last_failed_login_at: new Date(),
                locked_until: shouldLock
                  ? new Date(Date.now() + ACCOUNT_LOCK_WINDOW_MS)
                  : null,
              },
            });
            return null;
          }

          if (
            process.env.NODE_ENV === "production" &&
            user.role !== "READER" &&
            isKnownSeedPassword(password)
          ) {
            return null;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failed_login_count: 0,
              locked_until: null,
              last_failed_login_at: null,
            },
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            emailVerified: user.emailVerified,
            session_version: user.session_version,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: UserRole }).role;
        token.email_verified =
          (user as { emailVerified?: Date | null; email_verified?: Date | null }).emailVerified ??
          (user as { email_verified?: Date | null }).email_verified ??
          null;
        token.session_version = (user as { session_version: number }).session_version;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.email_verified = token.email_verified as Date | null;
        session.user.session_version = Number(token.session_version ?? 0);
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });
          if (existingUser) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() },
            });
          }
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return true; // Allow sign in even if update fails
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true, // Required when cPanel terminates TLS in front of Node.js
});
