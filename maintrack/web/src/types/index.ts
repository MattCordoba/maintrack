export type TaskType = "time_based" | "cycle_based" | "one_time";

export type TaskCategory =
  | "safety"
  | "preventative"
  | "routine"
  | "festive"
  | "regulatory";

export type TaskStatus =
  | "scheduled"
  | "due_soon"
  | "overdue"
  | "completed"
  | "cancelled"
  | "postponed";

export type IntervalUnit = "day" | "week" | "month" | "year";

export type CycleUnit = "km" | "miles" | "hours";

export type AssetCategory =
  | "home"
  | "vehicle"
  | "marine"
  | "trailer"
  | "aviation"
  | "human_powered"
  | "lawn_garden"
  | "shop_tools"
  | "heavy_equipment"
  | "gear_equipment";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
}

export interface AssetType {
  id: string;
  name: string;
  category: AssetCategory;
  iconSlug: string;
  hasMeter: boolean;
  meterUnit: string | null;
}

export interface Asset {
  id: string;
  ownerId: string;
  assetTypeId: string;
  name: string;
  parentAssetId: string | null;
  meterValue: number | null;
  meterUnit: string | null;
  meterLastUpdated: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

export interface AssetWithType extends Asset {
  assetType: AssetType;
  childAssets?: AssetWithType[];
  parentAsset?: Asset | null;
  overdueCount?: number;
  dueSoonCount?: number;
}

export interface Task {
  id: string;
  assetId: string;
  ownerId: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  intervalValue: number | null;
  intervalUnit: IntervalUnit | null;
  cycleInterval: number | null;
  cycleUnit: CycleUnit | null;
  category: TaskCategory;
  status: TaskStatus;
  dueDate: Date | null;
  lastCompletedAt: Date | null;
  lastCompletedMeter: number | null;
  postponedTo: Date | null;
  cancelledAt: Date | null;
  isFromTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskWithAsset extends Task {
  asset: AssetWithType;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  assetId: string;
  ownerId: string;
  title: string;
  completedAt: Date;
  notes: string | null;
  meterAtCompletion: number | null;
  photoUrl: string | null;
}

export interface TaskHistoryWithAsset extends TaskHistory {
  asset: AssetWithType;
}

export interface MeterReading {
  id: string;
  assetId: string;
  value: number;
  recordedAt: Date;
  notes: string | null;
}

export interface Notification {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

export interface AssetFile {
  id: string;
  assetId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

export interface TaskFile {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

// Task template for seeding
export interface TaskTemplate {
  title: string;
  taskType: TaskType;
  intervalValue?: number;
  intervalUnit?: IntervalUnit;
  cycleInterval?: number;
  cycleUnit?: CycleUnit;
  category: TaskCategory;
  condition?: string; // Optional condition like "if fireplace selected"
}
