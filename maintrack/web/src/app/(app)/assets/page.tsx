import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/actions";
import { db, assets, tasks, assetTypes } from "@/db";
import { eq, and, desc, isNull } from "drizzle-orm";
import { AssetsClient } from "./assets-client";
import { assetCategories } from "@/db/seed-data";

export default async function AssetsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get all assets for the user with their types and task counts
  const userAssets = await db.query.assets.findMany({
    where: and(
      eq(assets.ownerId, user.id),
      eq(assets.isArchived, false),
      isNull(assets.parentAssetId)
    ),
    with: {
      assetType: true,
      childAssets: {
        where: eq(assets.isArchived, false),
        with: {
          assetType: true,
        },
      },
    },
    orderBy: [desc(assets.updatedAt)],
  });

  // Top-level assets only (parentAssetId is null)
  const topLevelAssets = userAssets;

  // Get overdue counts for each asset
  const assetsWithCounts = await Promise.all(
    topLevelAssets.map(async (asset) => {
      const assetTasks = await db.query.tasks.findMany({
        where: and(eq(tasks.assetId, asset.id), eq(tasks.status, "overdue")),
      });

      // Also count child asset overdue tasks
      let childOverdueCount = 0;
      for (const child of asset.childAssets || []) {
        const childTasks = await db.query.tasks.findMany({
          where: and(eq(tasks.assetId, child.id), eq(tasks.status, "overdue")),
        });
        childOverdueCount += childTasks.length;
      }

      return {
        ...asset,
        overdueCount: assetTasks.length + childOverdueCount,
      };
    })
  );

  // Get all asset types for the add asset flow
  const allAssetTypes = await db.query.assetTypes.findMany({
    orderBy: [assetTypes.category, assetTypes.name],
  });

  return (
    <AssetsClient
      assets={assetsWithCounts}
      assetTypes={allAssetTypes}
      categories={assetCategories}
    />
  );
}
