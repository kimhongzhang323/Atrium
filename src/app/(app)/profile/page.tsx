import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/views/profile-form";
import { dbAdmin } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { auth } from "@/server/auth";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const user = await dbAdmin.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (!user) redirect("/api/auth/signin");

  return (
    <div className="view view-narrow">
      <div className="view-header">
        <div>
          <div className="eyebrow">PROFILE</div>
          <h1 className="view-title">Profile</h1>
          <p className="view-subtitle">{user.email}</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <ProfileForm initialName={user.name} />
        </div>
      </div>
    </div>
  );
}
