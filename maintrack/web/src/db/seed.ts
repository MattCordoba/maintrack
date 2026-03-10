import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { assetTypes } from "./schema";
import { assetTypesData } from "./seed-data";

async function seed() {
  console.log("🌱 Seeding database...");

  const db = drizzle(sql);

  // Seed asset types
  console.log("📦 Seeding asset types...");

  for (const assetType of assetTypesData) {
    await db.insert(assetTypes).values({
      name: assetType.name,
      category: assetType.category,
      iconSlug: assetType.iconSlug,
      hasMeter: assetType.hasMeter,
      meterUnit: assetType.meterUnit || null,
      isCustom: false,
    }).onConflictDoNothing();
  }

  console.log(`✅ Seeded ${assetTypesData.length} asset types`);
  console.log("🎉 Database seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
