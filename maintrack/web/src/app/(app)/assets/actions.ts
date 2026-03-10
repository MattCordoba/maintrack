"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, assets, tasks, assetTypes, meterReadings } from "@/db";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/supabase/actions";
import { taskTemplates } from "@/db/seed-data";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

export async function createAsset(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const assetTypeId = formData.get("assetTypeId") as string;
  const meterValue = formData.get("meterValue") as string;
  const notes = formData.get("notes") as string;
  const parentAssetId = formData.get("parentAssetId") as string | null;

  // Get the asset type
  const assetType = await db.query.assetTypes.findFirst({
    where: eq(assetTypes.id, assetTypeId),
  });

  if (!assetType) {
    throw new Error("Asset type not found");
  }

  // Create the asset
  const [newAsset] = await db
    .insert(assets)
    .values({
      ownerId: user.id,
      assetTypeId,
      name,
      parentAssetId: parentAssetId || null,
      meterValue: meterValue ? parseInt(meterValue, 10) : null,
      meterUnit: assetType.hasMeter ? assetType.meterUnit : null,
      meterLastUpdated: meterValue ? new Date() : null,
      notes: notes || null,
    })
    .returning();

  // If meter value was provided, create a meter reading
  if (meterValue && newAsset.meterValue) {
    await db.insert(meterReadings).values({
      assetId: newAsset.id,
      value: newAsset.meterValue,
      notes: "Initial reading on asset creation",
    });
  }

  // Auto-populate tasks from templates
  const templates = taskTemplates[assetType.name] || [];
  const now = new Date();

  for (const template of templates) {
    // Skip conditional tasks for now (they require additional user input)
    if (template.condition) continue;

    let dueDate: Date | null = null;

    if (template.taskType === "time_based" && template.intervalValue && template.intervalUnit) {
      switch (template.intervalUnit) {
        case "day":
          dueDate = addDays(now, template.intervalValue);
          break;
        case "week":
          dueDate = addWeeks(now, template.intervalValue);
          break;
        case "month":
          dueDate = addMonths(now, template.intervalValue);
          break;
        case "year":
          dueDate = addYears(now, template.intervalValue);
          break;
      }
    } else if (template.taskType === "cycle_based") {
      // For cycle-based tasks, set a default due date based on typical usage
      dueDate = addMonths(now, 3);
    }

    await db.insert(tasks).values({
      assetId: newAsset.id,
      ownerId: user.id,
      title: template.title,
      taskType: template.taskType,
      intervalValue: template.intervalValue || null,
      intervalUnit: template.intervalUnit || null,
      cycleInterval: template.cycleInterval || null,
      cycleUnit: template.cycleUnit || null,
      category: template.category,
      status: "scheduled",
      dueDate,
      isFromTemplate: true,
    });
  }

  revalidatePath("/assets");
  revalidatePath("/");
  redirect(`/assets/${newAsset.id}`);
}

export async function updateAsset(assetId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const notes = formData.get("notes") as string;

  await db
    .update(assets)
    .set({
      name,
      notes: notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(assets.id, assetId), eq(assets.ownerId, user.id)));

  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/assets");
}

export async function updateMeterReading(
  assetId: string,
  value: number,
  notes?: string
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Update asset meter value
  await db
    .update(assets)
    .set({
      meterValue: value,
      meterLastUpdated: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(assets.id, assetId), eq(assets.ownerId, user.id)));

  // Create meter reading record
  await db.insert(meterReadings).values({
    assetId,
    value,
    notes: notes || null,
  });

  // Check for cycle-based tasks that may now be due
  const asset = await db.query.assets.findFirst({
    where: eq(assets.id, assetId),
  });

  if (asset) {
    const cycleTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.assetId, assetId),
        eq(tasks.taskType, "cycle_based"),
        eq(tasks.status, "scheduled")
      ),
    });

    for (const task of cycleTasks) {
      if (task.cycleInterval && task.lastCompletedMeter) {
        const meterSinceLastComplete = value - task.lastCompletedMeter;
        if (meterSinceLastComplete >= task.cycleInterval) {
          await db
            .update(tasks)
            .set({ status: "overdue", updatedAt: new Date() })
            .where(eq(tasks.id, task.id));
        } else if (meterSinceLastComplete >= task.cycleInterval * 0.9) {
          await db
            .update(tasks)
            .set({ status: "due_soon", updatedAt: new Date() })
            .where(eq(tasks.id, task.id));
        }
      }
    }
  }

  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/");
}

export async function archiveAsset(assetId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  await db
    .update(assets)
    .set({
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(and(eq(assets.id, assetId), eq(assets.ownerId, user.id)));

  revalidatePath("/assets");
  revalidatePath("/");
  redirect("/assets");
}

export async function createChildAsset(
  parentAssetId: string,
  formData: FormData
) {
  formData.append("parentAssetId", parentAssetId);
  return createAsset(formData);
}
