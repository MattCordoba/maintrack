import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/actions";
import { db, assets, tasks, assetFiles, assetTypes } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { AssetDetailClient } from "./asset-detail-client";
import { assetCategories } from "@/db/seed-data";

interface Props {
  params: { id: string };
}

export default async function AssetDetailPage({ params }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const asset = await db.query.assets.findFirst({
    where: and(eq(assets.id, params.id), eq(assets.ownerId, user.id)),
    with: {
      assetType: true,
      parentAsset: {
        with: {
          assetType: true,
        },
      },
      childAssets: {
        where: eq(assets.isArchived, false),
        with: {
          assetType: true,
        },
      },
      files: {
        orderBy: [desc(assetFiles.uploadedAt)],
      },
    },
  });

  if (!asset) {
    notFound();
  }

  // Get tasks for this asset
  const assetTasks = await db.query.tasks.findMany({
    where: and(
      eq(tasks.assetId, asset.id),
      eq(tasks.status, "scheduled")
    ),
    orderBy: [tasks.dueDate],
  });

  const overdueTasks = await db.query.tasks.findMany({
    where: and(eq(tasks.assetId, asset.id), eq(tasks.status, "overdue")),
    orderBy: [tasks.dueDate],
  });

  const dueSoonTasks = await db.query.tasks.findMany({
    where: and(eq(tasks.assetId, asset.id), eq(tasks.status, "due_soon")),
    orderBy: [tasks.dueDate],
  });

  const oneTimeTasks = await db.query.tasks.findMany({
    where: and(
      eq(tasks.assetId, asset.id),
      eq(tasks.taskType, "one_time"),
    ),
    orderBy: [tasks.dueDate],
  });

  // Get all asset types for adding child assets
  const allAssetTypes = await db.query.assetTypes.findMany({
    orderBy: [assetTypes.category, assetTypes.name],
  });

  return (
    <AssetDetailClient
      asset={asset}
      tasks={[...overdueTasks, ...dueSoonTasks, ...assetTasks]}
      oneTimeTasks={oneTimeTasks.filter((t) => t.status !== "completed")}
      assetTypes={allAssetTypes}
      categories={assetCategories}
    />
  );
}
