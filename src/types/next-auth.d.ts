import type { DefaultSession } from "next-auth";
import type { RoleId, DeptId } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      orgId: string;
      role: RoleId;
      dept: DeptId | null;
    } & DefaultSession["user"];
  }
}

export {};
