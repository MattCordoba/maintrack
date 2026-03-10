import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/actions";
import { db, tasks, assets } from "@/db";
import { eq, and, desc, not } from "drizzle-orm";
import { TasksClient } from "./tasks-client";

interface Props {
  searchParams: { status?: string; type?: string };
}

export default async function TasksPage({ searchParams }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get all non-completed tasks for the user
  const userTasks = await db.query.tasks.findMany({
    where: and(
      eq(tasks.ownerId, user.id),
      not(eq(tasks.status, "completed")),
      not(eq(tasks.status, "cancelled"))
    ),
    orderBy: [tasks.dueDate],
    with: {
      asset: {
        with: {
          assetType: true,
        },
      },
    },
  });

  // Get user's assets for the add task dropdown
  const userAssets = await db.query.assets.findMany({
    where: and(
      eq(assets.ownerId, user.id),
      eq(assets.isArchived, false)
    ),
    with: {
      assetType: true,
    },
    orderBy: [assets.name],
  });

  const statusFilter = searchParams.status || "all";
  const typeFilter = searchParams.type || "all";

  return (
    <TasksClient
      tasks={userTasks}
      assets={userAssets}
      initialStatusFilter={statusFilter}
      initialTypeFilter={typeFilter}
    />
  );
}
