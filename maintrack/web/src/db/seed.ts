import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { assetTypes, users, assets, tasks, notifications } from "./schema";
import { assetTypesData, taskTemplates } from "./seed-data";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Step 1: Create user in Supabase Auth
  console.log("👤 Creating user in Supabase Auth...");
  const email = "user@email.com";
  const password = "password";

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === email);

  let supabaseUserId: string;

  if (existingUser) {
    console.log("   User already exists in Supabase Auth");
    supabaseUserId = existingUser.id;
  } else {
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    supabaseUserId = authData.user.id;
    console.log(`   ✅ Created auth user: ${email}`);
  }

  // Step 2: Create user in our database
  console.log("\n📦 Creating user record in database...");
  const existingDbUser = await db
    .select()
    .from(users)
    .where(eq(users.supabaseId, supabaseUserId))
    .limit(1);

  let userId: string;

  if (existingDbUser.length > 0) {
    console.log("   User already exists in database");
    userId = existingDbUser[0].id;
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        supabaseId: supabaseUserId,
        email,
        name: "Demo User",
      })
      .returning();
    userId = newUser.id;
    console.log(`   ✅ Created database user record`);
  }

  // Step 3: Seed asset types
  console.log("\n📦 Seeding asset types...");
  let seededCount = 0;
  for (const assetType of assetTypesData) {
    try {
      await db
        .insert(assetTypes)
        .values({
          name: assetType.name,
          category: assetType.category,
          iconSlug: assetType.iconSlug,
          hasMeter: assetType.hasMeter,
          meterUnit: assetType.meterUnit || null,
          isCustom: false,
        })
        .onConflictDoNothing();
      seededCount++;
    } catch {
      // Skip duplicates
    }
  }
  console.log(`   ✅ Seeded ${seededCount} asset types`);

  // Step 4: Create sample assets
  console.log("\n🏠 Creating sample assets...");

  // Get asset type IDs we need
  const allAssetTypes = await db.select().from(assetTypes);
  const getAssetTypeId = (name: string) =>
    allAssetTypes.find((t) => t.name === name)?.id;

  // Sample assets to create
  const sampleAssets = [
    {
      name: "Main House",
      assetTypeName: "House",
      meterValue: null,
    },
    {
      name: "2022 Toyota Tacoma",
      assetTypeName: "Truck",
      meterValue: 45000,
      meterUnit: "km",
    },
    {
      name: "Honda CRV",
      assetTypeName: "Car",
      meterValue: 82000,
      meterUnit: "km",
    },
    {
      name: "Bayliner 185",
      assetTypeName: "Motorboat",
      meterValue: 320,
      meterUnit: "hours",
    },
    {
      name: "John Deere Mower",
      assetTypeName: "Lawn Tractor",
      meterValue: 156,
      meterUnit: "hours",
    },
    {
      name: "Trek Mountain Bike",
      assetTypeName: "Mountain Bike",
      meterValue: null,
    },
    {
      name: "Travel Trailer",
      assetTypeName: "Travel Trailer",
      meterValue: null,
    },
  ];

  const createdAssets: { id: string; name: string; assetTypeName: string }[] =
    [];

  for (const asset of sampleAssets) {
    const assetTypeId = getAssetTypeId(asset.assetTypeName);
    if (!assetTypeId) {
      console.log(`   ⚠️ Asset type not found: ${asset.assetTypeName}`);
      continue;
    }

    // Check if asset already exists
    const existing = await db
      .select()
      .from(assets)
      .where(eq(assets.name, asset.name))
      .limit(1);

    if (existing.length > 0) {
      createdAssets.push({
        id: existing[0].id,
        name: asset.name,
        assetTypeName: asset.assetTypeName,
      });
      continue;
    }

    const [newAsset] = await db
      .insert(assets)
      .values({
        ownerId: userId,
        assetTypeId,
        name: asset.name,
        meterValue: asset.meterValue,
        meterUnit: asset.meterUnit || null,
        meterLastUpdated: asset.meterValue ? new Date() : null,
      })
      .returning();

    createdAssets.push({
      id: newAsset.id,
      name: asset.name,
      assetTypeName: asset.assetTypeName,
    });
    console.log(`   ✅ Created asset: ${asset.name}`);
  }

  // Step 5: Create tasks for assets
  console.log("\n📋 Creating tasks for assets...");

  for (const asset of createdAssets) {
    const templates = taskTemplates[asset.assetTypeName];
    if (!templates) continue;

    // Only create 3-5 tasks per asset to keep it manageable
    const tasksToCreate = templates.slice(0, 4);

    for (const template of tasksToCreate) {
      // Check if task already exists
      const existing = await db
        .select()
        .from(tasks)
        .where(eq(tasks.title, template.title))
        .limit(1);

      if (existing.length > 0) continue;

      // Calculate due date based on interval
      let dueDate = new Date();
      if (template.taskType === "time_based" && template.intervalUnit) {
        const now = new Date();
        switch (template.intervalUnit) {
          case "day":
            dueDate = new Date(
              now.getTime() +
                (template.intervalValue || 1) * 24 * 60 * 60 * 1000
            );
            break;
          case "week":
            dueDate = new Date(
              now.getTime() +
                (template.intervalValue || 1) * 7 * 24 * 60 * 60 * 1000
            );
            break;
          case "month":
            dueDate = new Date(
              now.setMonth(now.getMonth() + (template.intervalValue || 1))
            );
            break;
          case "year":
            dueDate = new Date(
              now.setFullYear(
                now.getFullYear() + (template.intervalValue || 1)
              )
            );
            break;
        }
      }

      // Randomize some tasks to be due soon or overdue for demo purposes
      const random = Math.random();
      let status: "scheduled" | "due_soon" | "overdue" = "scheduled";
      if (random < 0.2) {
        // 20% overdue
        dueDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        status = "overdue";
      } else if (random < 0.4) {
        // 20% due soon
        dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
        status = "due_soon";
      }

      await db.insert(tasks).values({
        assetId: asset.id,
        ownerId: userId,
        title: template.title,
        taskType: template.taskType,
        intervalValue: template.intervalValue,
        intervalUnit: template.intervalUnit,
        cycleInterval: template.cycleInterval,
        cycleUnit: template.cycleUnit,
        category: template.category,
        status,
        dueDate,
        isFromTemplate: true,
      });
    }
    console.log(
      `   ✅ Created ${tasksToCreate.length} tasks for: ${asset.name}`
    );
  }

  // Step 6: Create some sample notifications
  console.log("\n🔔 Creating sample notifications...");

  const sampleNotifications = [
    {
      title: "Oil Change Due Soon",
      body: "Your 2022 Toyota Tacoma is approaching 50,000 km. Schedule an oil change soon.",
      read: false,
    },
    {
      title: "Task Completed",
      body: "Smoke Detector Battery Change was marked as complete for Main House.",
      read: true,
    },
    {
      title: "Maintenance Reminder",
      body: "The Bayliner 185 engine has 320 hours. Consider scheduling an oil change.",
      read: false,
    },
  ];

  for (const notif of sampleNotifications) {
    await db
      .insert(notifications)
      .values({
        ownerId: userId,
        title: notif.title,
        body: notif.body,
        read: notif.read,
      })
      .onConflictDoNothing();
  }
  console.log(`   ✅ Created ${sampleNotifications.length} notifications`);

  console.log("\n🎉 Database seeding complete!");
  console.log(`\n📧 Login credentials:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
}

seed()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    pool.end();
    process.exit(1);
  });
