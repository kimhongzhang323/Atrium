import NextAuth from "next-auth";

import type { Role } from "@/lib/types";
import { ROLES } from "@/lib/roles";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [],
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
});

export function requirePermission(role: Role, perm: string) {
  if (!role.permissions.includes(perm as never)) {
    throw new Error(`Permission denied: ${perm}`);
  }
}

export function roleFor(id: keyof typeof ROLES) {
  return ROLES[id];
}
