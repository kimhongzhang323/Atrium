import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

import { dbAdmin } from "@/server/db/client";
import {
  accounts,
  organizations,
  orgMembers,
  sessions as sessionsTable,
  users,
  verificationTokens,
} from "@/server/db/schema";

function slugFromEmail(email: string): string {
  const domain = email.split("@")[1] ?? "org";
  return domain.replace(/\..*$/, "").toLowerCase();
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(dbAdmin, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM,
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async signIn({ user }) {
      if (!user.id || !user.email) return false;

      const existing = await dbAdmin.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      if (existing?.orgId) return true;

      const email = user.email;
      const userId = user.id;
      await dbAdmin.transaction(async (tx) => {
        const slugBase = slugFromEmail(email);
        const slug = `${slugBase}-${userId.slice(0, 6)}`;
        const [org] = await tx
          .insert(organizations)
          .values({
            name: `${slugBase.toUpperCase()} Organization`,
            slug,
            createdBy: userId,
          })
          .returning();
        if (!org) throw new Error("Failed to create organization");

        await tx
          .update(users)
          .set({
            orgId: org.id,
            role: "director",
            initials: initialsOf(user.name ?? email),
          })
          .where(eq(users.id, userId));

        await tx.insert(orgMembers).values({
          orgId: org.id,
          userId,
          role: "director",
        });
      });
      return true;
    },
    async session({ session, user }) {
      const row = await dbAdmin.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      if (row) {
        session.user.id = row.id;
        session.user.orgId = row.orgId!;
        session.user.role = row.role;
        session.user.dept = row.dept;
      }
      return session;
    },
  },
});
