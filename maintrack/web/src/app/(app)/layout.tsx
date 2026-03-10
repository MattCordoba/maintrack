import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { db, tasks, notifications } from "@/db";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/supabase/actions";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUser = await getUser();

  if (!supabaseUser) {
    redirect("/login");
  }

  const dbUser = await getCurrentUser();

  // Get counts for navigation badges
  let overdueCount = 0;
  let notificationCount = 0;

  if (dbUser) {
    const overdueTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.ownerId, dbUser.id),
        eq(tasks.status, "overdue")
      ),
    });
    overdueCount = overdueTasks.length;

    const unreadNotifications = await db.query.notifications.findMany({
      where: and(
        eq(notifications.ownerId, dbUser.id),
        eq(notifications.read, false)
      ),
    });
    notificationCount = unreadNotifications.length;
  }

  return (
    <AppLayout overdueCount={overdueCount} notificationCount={notificationCount}>
      {children}
    </AppLayout>
  );
}
