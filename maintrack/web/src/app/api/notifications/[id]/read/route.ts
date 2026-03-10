import { NextRequest, NextResponse } from "next/server";
import { db, notifications } from "@/db";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/supabase/actions";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, params.id),
        eq(notifications.ownerId, user.id)
      )
    );

  return NextResponse.json({ success: true });
}
