import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/actions";
import { db, assets, assetTypes } from "@/db";
import { eq, and } from "drizzle-orm";
import { NewTaskClient } from "./new-task-client";

interface Props {
  searchParams: { assetId?: string };
}

export default async function NewTaskPage({ searchParams }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { assetId } = searchParams;

  if (!assetId) {
    redirect("/assets");
  }

  const asset = await db.query.assets.findFirst({
    where: and(eq(assets.id, assetId), eq(assets.ownerId, user.id)),
    with: {
      assetType: true,
    },
  });

  if (!asset) {
    redirect("/assets");
  }

  return <NewTaskClient asset={asset} />;
}
