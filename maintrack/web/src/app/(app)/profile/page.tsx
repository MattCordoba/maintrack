import { redirect } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/supabase/actions";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <ProfileClient user={user} />;
}
