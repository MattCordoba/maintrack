import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db, assetFiles, taskFiles } from "@/db";
import { getCurrentUser } from "@/lib/supabase/actions";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "asset" | "task";
    const targetId = formData.get("targetId") as string;

    if (!file || !type || !targetId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    });

    // Save file record to database
    if (type === "asset") {
      await db.insert(assetFiles).values({
        assetId: targetId,
        fileName: file.name,
        fileUrl: blob.url,
        fileType: file.type,
      });
    } else {
      await db.insert(taskFiles).values({
        taskId: targetId,
        fileName: file.name,
        fileUrl: blob.url,
        fileType: file.type,
      });
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
