import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/actions";
import { db, notifications } from "@/db";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Check, Trash2 } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { NotificationsClient } from "./notifications-client";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userNotifications = await db.query.notifications.findMany({
    where: eq(notifications.ownerId, user.id),
    orderBy: [desc(notifications.createdAt)],
    limit: 50,
  });

  return <NotificationsClient notifications={userNotifications} />;
}
