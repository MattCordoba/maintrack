import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const taskTypeEnum = pgEnum("task_type", [
  "time_based",
  "cycle_based",
  "one_time",
]);

export const taskCategoryEnum = pgEnum("task_category", [
  "safety",
  "preventative",
  "routine",
  "festive",
  "regulatory",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "scheduled",
  "due_soon",
  "overdue",
  "completed",
  "cancelled",
  "postponed",
]);

export const intervalUnitEnum = pgEnum("interval_unit", [
  "day",
  "week",
  "month",
  "year",
]);

export const cycleUnitEnum = pgEnum("cycle_unit", ["km", "miles", "hours"]);

export const assetCategoryEnum = pgEnum("asset_category", [
  "home",
  "vehicle",
  "marine",
  "trailer",
  "aviation",
  "human_powered",
  "lawn_garden",
  "shop_tools",
  "heavy_equipment",
  "gear_equipment",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  supabaseId: text("supabase_id").unique().notNull(),
  name: text("name"),
  email: text("email").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Asset Types table (seeded with predefined types)
export const assetTypes = pgTable("asset_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: assetCategoryEnum("category").notNull(),
  iconSlug: text("icon_slug").notNull(),
  hasMeter: boolean("has_meter").default(false).notNull(),
  meterUnit: text("meter_unit"),
  isCustom: boolean("is_custom").default(false).notNull(),
  ownerId: uuid("owner_id").references(() => users.id),
});

// Assets table
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  assetTypeId: uuid("asset_type_id")
    .references(() => assetTypes.id)
    .notNull(),
  name: text("name").notNull(),
  parentAssetId: uuid("parent_asset_id"),
  meterValue: integer("meter_value"),
  meterUnit: text("meter_unit"),
  meterLastUpdated: timestamp("meter_last_updated"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id")
    .references(() => assets.id, { onDelete: "cascade" })
    .notNull(),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  taskType: taskTypeEnum("task_type").notNull(),
  intervalValue: integer("interval_value"),
  intervalUnit: intervalUnitEnum("interval_unit"),
  cycleInterval: integer("cycle_interval"),
  cycleUnit: cycleUnitEnum("cycle_unit"),
  category: taskCategoryEnum("category").notNull(),
  status: taskStatusEnum("status").default("scheduled").notNull(),
  dueDate: timestamp("due_date"),
  lastCompletedAt: timestamp("last_completed_at"),
  lastCompletedMeter: integer("last_completed_meter"),
  postponedTo: timestamp("postponed_to"),
  cancelledAt: timestamp("cancelled_at"),
  isFromTemplate: boolean("is_from_template").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Task History table
export const taskHistory = pgTable("task_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .references(() => tasks.id)
    .notNull(),
  assetId: uuid("asset_id")
    .references(() => assets.id)
    .notNull(),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  notes: text("notes"),
  meterAtCompletion: integer("meter_at_completion"),
  photoUrl: text("photo_url"),
});

// Meter Readings table
export const meterReadings = pgTable("meter_readings", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id")
    .references(() => assets.id, { onDelete: "cascade" })
    .notNull(),
  value: integer("value").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  notes: text("notes"),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Asset Files table
export const assetFiles = pgTable("asset_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id")
    .references(() => assets.id, { onDelete: "cascade" })
    .notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Task Files table
export const taskFiles = pgTable("task_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assets: many(assets),
  tasks: many(tasks),
  notifications: many(notifications),
}));

export const assetTypesRelations = relations(assetTypes, ({ many, one }) => ({
  assets: many(assets),
  owner: one(users, {
    fields: [assetTypes.ownerId],
    references: [users.id],
  }),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  owner: one(users, {
    fields: [assets.ownerId],
    references: [users.id],
  }),
  assetType: one(assetTypes, {
    fields: [assets.assetTypeId],
    references: [assetTypes.id],
  }),
  parentAsset: one(assets, {
    fields: [assets.parentAssetId],
    references: [assets.id],
    relationName: "childAssets",
  }),
  childAssets: many(assets, {
    relationName: "childAssets",
  }),
  tasks: many(tasks),
  meterReadings: many(meterReadings),
  files: many(assetFiles),
  taskHistory: many(taskHistory),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  asset: one(assets, {
    fields: [tasks.assetId],
    references: [assets.id],
  }),
  owner: one(users, {
    fields: [tasks.ownerId],
    references: [users.id],
  }),
  history: many(taskHistory),
  files: many(taskFiles),
}));

export const taskHistoryRelations = relations(taskHistory, ({ one }) => ({
  task: one(tasks, {
    fields: [taskHistory.taskId],
    references: [tasks.id],
  }),
  asset: one(assets, {
    fields: [taskHistory.assetId],
    references: [assets.id],
  }),
  owner: one(users, {
    fields: [taskHistory.ownerId],
    references: [users.id],
  }),
}));

export const meterReadingsRelations = relations(meterReadings, ({ one }) => ({
  asset: one(assets, {
    fields: [meterReadings.assetId],
    references: [assets.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  owner: one(users, {
    fields: [notifications.ownerId],
    references: [users.id],
  }),
}));

export const assetFilesRelations = relations(assetFiles, ({ one }) => ({
  asset: one(assets, {
    fields: [assetFiles.assetId],
    references: [assets.id],
  }),
}));

export const taskFilesRelations = relations(taskFiles, ({ one }) => ({
  task: one(tasks, {
    fields: [taskFiles.taskId],
    references: [tasks.id],
  }),
}));
