import { NextRequest, NextResponse } from "next/server";
import { db, tasks, notifications, users } from "@/db";
import { eq, and, not, lt, lte, gt } from "drizzle-orm";
import { addDays } from "date-fns";

// This endpoint is called by Vercel Cron at midnight UTC daily
export async function GET(request: NextRequest) {
  // Verify cron secret (set in Vercel environment)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dueSoonThreshold = addDays(now, 7); // 7 days from now

  try {
    // Update overdue tasks (past due date, not completed/cancelled)
    const overdueResult = await db
      .update(tasks)
      .set({ status: "overdue", updatedAt: now })
      .where(
        and(
          lt(tasks.dueDate, now),
          not(eq(tasks.status, "completed")),
          not(eq(tasks.status, "cancelled")),
          not(eq(tasks.status, "overdue"))
        )
      );

    // Update due soon tasks (within 7 days, not overdue/completed/cancelled)
    const dueSoonResult = await db
      .update(tasks)
      .set({ status: "due_soon", updatedAt: now })
      .where(
        and(
          lte(tasks.dueDate, dueSoonThreshold),
          gt(tasks.dueDate, now),
          eq(tasks.status, "scheduled")
        )
      );

    // Get tasks that became overdue today for notifications
    const newlyOverdueTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.status, "overdue"),
        lt(tasks.dueDate, now),
        gt(tasks.dueDate, addDays(now, -1))
      ),
      with: {
        asset: true,
      },
    });

    // Create notifications for newly overdue tasks
    for (const task of newlyOverdueTasks) {
      await db.insert(notifications).values({
        ownerId: task.ownerId,
        title: "Task Overdue",
        body: `${task.title} on your ${task.asset.name} is overdue`,
      });
    }

    // Get tasks that are becoming due soon for notifications
    const dueSoonTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.status, "due_soon"),
        lte(tasks.dueDate, addDays(now, 7)),
        gt(tasks.dueDate, addDays(now, 6))
      ),
      with: {
        asset: true,
      },
    });

    // Create notifications for due soon tasks (7 days out)
    for (const task of dueSoonTasks) {
      await db.insert(notifications).values({
        ownerId: task.ownerId,
        title: "Task Due Soon",
        body: `${task.title} on your ${task.asset.name} is due in 7 days`,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      overdueNotifications: newlyOverdueTasks.length,
      dueSoonNotifications: dueSoonTasks.length,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
