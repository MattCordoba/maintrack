"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, tasks, taskHistory, assets, meterReadings } from "@/db";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/supabase/actions";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import type { TaskType, TaskCategory, IntervalUnit, CycleUnit } from "@/types";

export async function createTask(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const assetId = formData.get("assetId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const taskType = formData.get("taskType") as TaskType;
  const category = formData.get("category") as TaskCategory;
  const intervalValue = formData.get("intervalValue") as string;
  const intervalUnit = formData.get("intervalUnit") as IntervalUnit;
  const cycleInterval = formData.get("cycleInterval") as string;
  const cycleUnit = formData.get("cycleUnit") as CycleUnit | null;
  const dueDateStr = formData.get("dueDate") as string;

  let dueDate: Date | null = null;

  if (dueDateStr) {
    dueDate = new Date(dueDateStr);
  } else if (taskType === "time_based" && intervalValue && intervalUnit) {
    const now = new Date();
    const interval = parseInt(intervalValue, 10);
    switch (intervalUnit) {
      case "day":
        dueDate = addDays(now, interval);
        break;
      case "week":
        dueDate = addWeeks(now, interval);
        break;
      case "month":
        dueDate = addMonths(now, interval);
        break;
      case "year":
        dueDate = addYears(now, interval);
        break;
    }
  }

  await db.insert(tasks).values({
    assetId,
    ownerId: user.id,
    title,
    description: description || null,
    taskType,
    category,
    intervalValue: intervalValue ? parseInt(intervalValue, 10) : null,
    intervalUnit: intervalUnit || null,
    cycleInterval: cycleInterval ? parseInt(cycleInterval, 10) : null,
    cycleUnit: cycleUnit || null,
    dueDate,
    status: "scheduled",
    isFromTemplate: false,
  });

  revalidatePath("/tasks");
  revalidatePath("/");
  revalidatePath(`/assets/${assetId}`);
}

export async function completeTask(
  taskId: string,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const notes = formData.get("notes") as string;
  const meterValue = formData.get("meterValue") as string;
  const photoUrl = formData.get("photoUrl") as string;

  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.ownerId, user.id)),
    with: {
      asset: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const now = new Date();
  const meterAtCompletion = meterValue ? parseInt(meterValue, 10) : null;

  // Create history entry
  await db.insert(taskHistory).values({
    taskId,
    assetId: task.assetId,
    ownerId: user.id,
    title: task.title,
    completedAt: now,
    notes: notes || null,
    meterAtCompletion,
    photoUrl: photoUrl || null,
  });

  // Update meter reading if provided
  if (meterAtCompletion && task.asset.meterUnit) {
    await db.update(assets).set({
      meterValue: meterAtCompletion,
      meterLastUpdated: now,
      updatedAt: now,
    }).where(eq(assets.id, task.assetId));

    await db.insert(meterReadings).values({
      assetId: task.assetId,
      value: meterAtCompletion,
      notes: `Recorded during: ${task.title}`,
    });
  }

  // Calculate next due date for recurring tasks
  if (task.taskType === "time_based" && task.intervalValue && task.intervalUnit) {
    let nextDueDate: Date;
    switch (task.intervalUnit) {
      case "day":
        nextDueDate = addDays(now, task.intervalValue);
        break;
      case "week":
        nextDueDate = addWeeks(now, task.intervalValue);
        break;
      case "month":
        nextDueDate = addMonths(now, task.intervalValue);
        break;
      case "year":
        nextDueDate = addYears(now, task.intervalValue);
        break;
      default:
        nextDueDate = addMonths(now, 1);
    }

    await db.update(tasks).set({
      status: "scheduled",
      dueDate: nextDueDate,
      lastCompletedAt: now,
      lastCompletedMeter: meterAtCompletion,
      postponedTo: null,
      updatedAt: now,
    }).where(eq(tasks.id, taskId));
  } else if (task.taskType === "cycle_based") {
    // For cycle-based tasks, reset status and update meter
    await db.update(tasks).set({
      status: "scheduled",
      lastCompletedAt: now,
      lastCompletedMeter: meterAtCompletion,
      postponedTo: null,
      updatedAt: now,
    }).where(eq(tasks.id, taskId));
  } else {
    // One-time task - mark as completed
    await db.update(tasks).set({
      status: "completed",
      lastCompletedAt: now,
      updatedAt: now,
    }).where(eq(tasks.id, taskId));
  }

  revalidatePath("/tasks");
  revalidatePath("/");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/assets/${task.assetId}`);
}

export async function postponeTask(
  taskId: string,
  postponeToDate: Date,
  reason?: string
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  await db.update(tasks).set({
    status: "postponed",
    postponedTo: postponeToDate,
    updatedAt: new Date(),
  }).where(and(eq(tasks.id, taskId), eq(tasks.ownerId, user.id)));

  revalidatePath("/tasks");
  revalidatePath("/");
  revalidatePath(`/tasks/${taskId}`);
}

export async function cancelTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  await db.update(tasks).set({
    status: "cancelled",
    cancelledAt: new Date(),
    updatedAt: new Date(),
  }).where(and(eq(tasks.id, taskId), eq(tasks.ownerId, user.id)));

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function updateTask(taskId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as TaskCategory;
  const intervalValue = formData.get("intervalValue") as string;
  const intervalUnit = formData.get("intervalUnit") as IntervalUnit;
  const dueDateStr = formData.get("dueDate") as string;

  await db.update(tasks).set({
    title,
    description: description || null,
    category,
    intervalValue: intervalValue ? parseInt(intervalValue, 10) : null,
    intervalUnit: intervalUnit || null,
    dueDate: dueDateStr ? new Date(dueDateStr) : null,
    updatedAt: new Date(),
  }).where(and(eq(tasks.id, taskId), eq(tasks.ownerId, user.id)));

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
}
