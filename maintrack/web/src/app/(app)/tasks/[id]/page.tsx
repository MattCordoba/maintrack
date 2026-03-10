import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/actions";
import { db, tasks, taskHistory, taskFiles } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { TaskDetailClient } from "./task-detail-client";

interface Props {
  params: { id: string };
}

export default async function TaskDetailPage({ params }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, params.id), eq(tasks.ownerId, user.id)),
    with: {
      asset: {
        with: {
          assetType: true,
        },
      },
      files: {
        orderBy: [desc(taskFiles.uploadedAt)],
      },
    },
  });

  if (!task) {
    notFound();
  }

  // Get recent history for this task
  const history = await db.query.taskHistory.findMany({
    where: eq(taskHistory.taskId, task.id),
    orderBy: [desc(taskHistory.completedAt)],
    limit: 5,
  });

  return <TaskDetailClient task={task} history={history} />;
}
