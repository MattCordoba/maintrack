import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/actions";
import { db, tasks, taskHistory, assets, assetTypes } from "@/db";
import { eq, and, desc, inArray } from "drizzle-orm";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get all tasks for the user
  const userTasks = await db.query.tasks.findMany({
    where: eq(tasks.ownerId, user.id),
    with: {
      asset: {
        with: {
          assetType: true,
        },
      },
    },
  });

  // Get task counts by status
  const taskCounts = {
    overdue: userTasks.filter((t) => t.status === "overdue").length,
    dueSoon: userTasks.filter((t) => t.status === "due_soon").length,
    scheduled: userTasks.filter((t) => t.status === "scheduled").length,
    oneTime: userTasks.filter((t) => t.taskType === "one_time" && t.status !== "completed").length,
    total: userTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length,
  };

  // Get overdue tasks
  const overdueTasks = userTasks
    .filter((t) => t.status === "overdue")
    .slice(0, 5);

  // Get due soon tasks
  const dueSoonTasks = userTasks
    .filter((t) => t.status === "due_soon")
    .slice(0, 5);

  // Get one-time tasks
  const oneTimeTasks = userTasks
    .filter((t) => t.taskType === "one_time" && t.status !== "completed")
    .slice(0, 5);

  // Get recent history
  const recentHistory = await db.query.taskHistory.findMany({
    where: eq(taskHistory.ownerId, user.id),
    orderBy: [desc(taskHistory.completedAt)],
    limit: 5,
    with: {
      asset: {
        with: {
          assetType: true,
        },
      },
    },
  });

  // Get total asset count
  const userAssets = await db.query.assets.findMany({
    where: and(
      eq(assets.ownerId, user.id),
      eq(assets.isArchived, false)
    ),
  });

  return (
    <DashboardClient
      userName={user.name || "there"}
      taskCounts={taskCounts}
      overdueTasks={overdueTasks}
      dueSoonTasks={dueSoonTasks}
      oneTimeTasks={oneTimeTasks}
      recentHistory={recentHistory}
      assetCount={userAssets.length}
    />
  );
}
