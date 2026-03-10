import { NextRequest, NextResponse } from "next/server";
import { db, tasks, assets, taskHistory } from "@/db";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/supabase/actions";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";
  const type = searchParams.get("type") || "all";

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const searchPattern = `%${query}%`;
  const results: Array<{
    type: "task" | "asset";
    id: string;
    title: string;
    subtitle: string;
    status?: string;
    iconSlug: string;
    assetId?: string;
  }> = [];

  // Search tasks
  if (type === "all" || type === "task") {
    let taskConditions = [
      eq(tasks.ownerId, user.id),
      or(
        ilike(tasks.title, searchPattern),
        ilike(tasks.description, searchPattern)
      ),
    ];

    if (status !== "all") {
      taskConditions.push(eq(tasks.status, status as "overdue" | "due_soon" | "scheduled"));
    }

    const taskResults = await db.query.tasks.findMany({
      where: and(...taskConditions),
      with: {
        asset: {
          with: {
            assetType: true,
          },
        },
      },
      limit: 20,
    });

    taskResults.forEach((task) => {
      results.push({
        type: "task",
        id: task.id,
        title: task.title,
        subtitle: task.asset.name,
        status: task.status,
        iconSlug: task.asset.assetType.iconSlug,
        assetId: task.assetId,
      });
    });
  }

  // Search assets
  if (type === "all" || type === "asset") {
    const assetResults = await db.query.assets.findMany({
      where: and(
        eq(assets.ownerId, user.id),
        eq(assets.isArchived, false),
        or(
          ilike(assets.name, searchPattern),
          ilike(assets.notes, searchPattern)
        )
      ),
      with: {
        assetType: true,
      },
      limit: 20,
    });

    assetResults.forEach((asset) => {
      results.push({
        type: "asset",
        id: asset.id,
        title: asset.name,
        subtitle: asset.assetType.name,
        iconSlug: asset.assetType.iconSlug,
      });
    });
  }

  // Search task history notes
  if (type === "all" || type === "task") {
    const historyResults = await db.query.taskHistory.findMany({
      where: and(
        eq(taskHistory.ownerId, user.id),
        ilike(taskHistory.notes, searchPattern)
      ),
      with: {
        asset: {
          with: {
            assetType: true,
          },
        },
      },
      limit: 10,
    });

    historyResults.forEach((item) => {
      // Only add if not already in results
      const exists = results.some(
        (r) => r.type === "task" && r.id === item.taskId
      );
      if (!exists) {
        results.push({
          type: "task",
          id: item.taskId,
          title: item.title,
          subtitle: `${item.asset.name} - History`,
          status: "completed",
          iconSlug: item.asset.assetType.iconSlug,
          assetId: item.assetId,
        });
      }
    });
  }

  return NextResponse.json({ results });
}
