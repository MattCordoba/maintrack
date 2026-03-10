"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetIcon } from "@/components/shared/asset-icon";
import { FAB } from "@/components/shared/fab";
import {
  ArrowLeft,
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  History,
  Gauge,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  Upload,
} from "lucide-react";
import { formatDate, formatRelativeDate, getDaysUntilDue } from "@/lib/utils";
import { updateAsset, updateMeterReading, archiveAsset, createChildAsset } from "../actions";
import type { AssetCategory } from "@/types";

interface AssetType {
  id: string;
  name: string;
  category: AssetCategory;
  iconSlug: string;
  hasMeter: boolean;
  meterUnit: string | null;
}

interface AssetFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

interface Asset {
  id: string;
  name: string;
  notes: string | null;
  meterValue: number | null;
  meterUnit: string | null;
  meterLastUpdated: Date | null;
  assetType: AssetType;
  parentAsset?: {
    id: string;
    name: string;
    assetType: AssetType;
  } | null;
  childAssets?: Asset[];
  files?: AssetFile[];
}

interface Task {
  id: string;
  title: string;
  status: string;
  taskType: string;
  dueDate: Date | null;
  category: string;
}

interface Category {
  id: AssetCategory;
  name: string;
  icon: string;
  emoji: string;
}

interface AssetDetailClientProps {
  asset: Asset;
  tasks: Task[];
  oneTimeTasks: Task[];
  assetTypes: AssetType[];
  categories: Category[];
}

export function AssetDetailClient({
  asset,
  tasks,
  oneTimeTasks,
  assetTypes,
  categories,
}: AssetDetailClientProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMeterDialogOpen, setIsMeterDialogOpen] = useState(false);
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [addChildStep, setAddChildStep] = useState<"category" | "type" | "details">("category");
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState<AssetCategory | null>(null);
  const [selectedTypeForAdd, setSelectedTypeForAdd] = useState<AssetType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recurringTasks = tasks.filter((t) => t.taskType !== "one_time");

  const handleEditSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    await updateAsset(asset.id, formData);
    setIsEditDialogOpen(false);
    setIsSubmitting(false);
  };

  const handleMeterSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const value = parseInt(formData.get("value") as string, 10);
    const notes = formData.get("notes") as string;
    await updateMeterReading(asset.id, value, notes);
    setIsMeterDialogOpen(false);
    setIsSubmitting(false);
  };

  const handleArchive = async () => {
    setIsSubmitting(true);
    await archiveAsset(asset.id);
  };

  const handleCategorySelect = (category: AssetCategory) => {
    setSelectedCategoryForAdd(category);
    setAddChildStep("type");
  };

  const handleTypeSelect = (type: AssetType) => {
    setSelectedTypeForAdd(type);
    setAddChildStep("details");
  };

  const handleCreateChildAsset = async (formData: FormData) => {
    if (!selectedTypeForAdd) return;
    setIsSubmitting(true);
    formData.append("assetTypeId", selectedTypeForAdd.id);
    await createChildAsset(asset.id, formData);
    setIsAddChildDialogOpen(false);
    setAddChildStep("category");
    setSelectedCategoryForAdd(null);
    setSelectedTypeForAdd(null);
    setIsSubmitting(false);
  };

  const resetAddChildDialog = () => {
    setAddChildStep("category");
    setSelectedCategoryForAdd(null);
    setSelectedTypeForAdd(null);
  };

  const typesForCategory = assetTypes.filter(
    (t) => t.category === selectedCategoryForAdd
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return <Badge variant="overdue">Overdue</Badge>;
      case "due_soon":
        return <Badge variant="dueSoon">Due Soon</Badge>;
      case "scheduled":
        return <Badge variant="scheduled">Scheduled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:relative md:border-0 md:bg-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href="/assets">
              <Button variant="ghost" size="icon" className="md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <AssetIcon iconSlug={asset.assetType.iconSlug} size="lg" />
            <div>
              <h1 className="text-xl font-bold">{asset.name}</h1>
              <p className="text-sm text-muted-foreground">
                {asset.assetType.name}
                {asset.parentAsset && (
                  <span>
                    {" "}
                    • Part of{" "}
                    <Link
                      href={`/assets/${asset.parentAsset.id}`}
                      className="text-primary hover:underline"
                    >
                      {asset.parentAsset.name}
                    </Link>
                  </span>
                )}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/assets/${asset.id}/history`}>
                  <History className="h-4 w-4 mr-2" />
                  View History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsArchiveDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 space-y-6 pb-24 md:pb-6">
        {/* Meter Reading */}
        {asset.meterValue !== null && asset.meterUnit && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current {asset.meterUnit}
                    </p>
                    <p className="text-2xl font-bold">
                      {asset.meterValue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setIsMeterDialogOpen(true)}>
                  Update
                </Button>
              </div>
              {asset.meterLastUpdated && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated {formatDate(asset.meterLastUpdated)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {asset.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Tasks and Files */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">
              Tasks{" "}
              {recurringTasks.filter((t) => t.status === "overdue").length > 0 && (
                <Badge variant="overdue" className="ml-2 h-5 px-1.5">
                  {recurringTasks.filter((t) => t.status === "overdue").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="children">
              Sub-Assets
              {asset.childAssets && asset.childAssets.length > 0 && (
                <span className="ml-2 text-muted-foreground">
                  ({asset.childAssets.length})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="files">
              Files
              {asset.files && asset.files.length > 0 && (
                <span className="ml-2 text-muted-foreground">
                  ({asset.files.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            {/* Recurring Tasks */}
            <div>
              <h3 className="font-semibold mb-2">Recurring Tasks</h3>
              {recurringTasks.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No recurring tasks
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {recurringTasks.map((task) => (
                    <Link key={task.id} href={`/tasks/${task.id}`}>
                      <Card className="transition-all hover:shadow-md hover:border-primary/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.dueDate
                                  ? formatRelativeDate(task.dueDate)
                                  : "No due date"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(task.status)}
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* One-Time Tasks */}
            {oneTimeTasks.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">One-Time Tasks</h3>
                <div className="space-y-2">
                  {oneTimeTasks.map((task) => (
                    <Link key={task.id} href={`/tasks/${task.id}`}>
                      <Card className="transition-all hover:shadow-md hover:border-primary/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.dueDate
                                  ? formatRelativeDate(task.dueDate)
                                  : "No due date"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="oneTime">One-Time</Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="children" className="mt-4">
            {!asset.childAssets || asset.childAssets.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No sub-assets. Add components like motors, pumps, or other parts.
                  </p>
                  <Button onClick={() => setIsAddChildDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub-Asset
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {asset.childAssets.map((child) => (
                  <Link key={child.id} href={`/assets/${child.id}`}>
                    <Card className="transition-all hover:shadow-md hover:border-primary/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <AssetIcon iconSlug={child.assetType.iconSlug} />
                          <div className="flex-1">
                            <p className="font-medium">{child.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {child.assetType.name}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAddChildDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-Asset
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            {!asset.files || asset.files.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No files yet. Upload photos, manuals, or documents.
                  </p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {asset.files.map((file) => (
                  <Card key={file.id} className="overflow-hidden">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file.fileType.startsWith("image/") ? (
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          <img
                            src={file.fileUrl}
                            alt={file.fileName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <CardContent className="p-2">
                        <p className="text-sm truncate">{file.fileName}</p>
                      </CardContent>
                    </a>
                  </Card>
                ))}
                <Card className="border-dashed">
                  <CardContent className="aspect-square flex items-center justify-center">
                    <Button variant="ghost" className="h-full w-full flex-col gap-2">
                      <Upload className="h-8 w-8" />
                      <span>Upload</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* FAB - Add Task */}
      <FAB onClick={() => router.push(`/tasks/new?assetId=${asset.id}`)} label="Add task" />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          <form action={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={asset.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                defaultValue={asset.notes || ""}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Meter Update Dialog */}
      <Dialog open={isMeterDialogOpen} onOpenChange={setIsMeterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update {asset.meterUnit}</DialogTitle>
            <DialogDescription>
              Enter the current {asset.meterUnit?.toLowerCase()} reading
            </DialogDescription>
          </DialogHeader>
          <form action={handleMeterSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meter-value">Current Reading</Label>
              <Input
                id="meter-value"
                name="value"
                type="number"
                defaultValue={asset.meterValue || 0}
                min={asset.meterValue || 0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meter-notes">Notes (optional)</Label>
              <Textarea id="meter-notes" name="notes" rows={2} />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMeterDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive {asset.name}? This will hide it from
              your asset list but preserve its history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsArchiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchive}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Archiving..." : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Child Asset Dialog */}
      <Dialog
        open={isAddChildDialogOpen}
        onOpenChange={(open) => {
          setIsAddChildDialogOpen(open);
          if (!open) resetAddChildDialog();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {addChildStep === "category" && "Select Category"}
              {addChildStep === "type" && "Select Asset Type"}
              {addChildStep === "details" && "Sub-Asset Details"}
            </DialogTitle>
            <DialogDescription>
              Add a sub-component to {asset.name}
            </DialogDescription>
          </DialogHeader>

          {/* Category Selection */}
          {addChildStep === "category" && (
            <ScrollArea className="h-80">
              <div className="grid grid-cols-2 gap-2 p-1">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-sm">{cat.name}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Type Selection */}
          {addChildStep === "type" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -mt-2"
                onClick={() => setAddChildStep("category")}
              >
                ← Back
              </Button>
              <ScrollArea className="h-80">
                <div className="space-y-2 p-1">
                  {typesForCategory.map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto p-3"
                      onClick={() => handleTypeSelect(type)}
                    >
                      <AssetIcon iconSlug={type.iconSlug} size="sm" />
                      <span>{type.name}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          {/* Details Form */}
          {addChildStep === "details" && selectedTypeForAdd && (
            <form action={handleCreateChildAsset} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit -mt-2"
                onClick={() => setAddChildStep("type")}
              >
                ← Back
              </Button>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <AssetIcon iconSlug={selectedTypeForAdd.iconSlug} />
                <span className="font-medium">{selectedTypeForAdd.name}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="child-name">Name *</Label>
                <Input
                  id="child-name"
                  name="name"
                  placeholder={`${asset.name}'s ${selectedTypeForAdd.name}`}
                  required
                />
              </div>

              {selectedTypeForAdd.hasMeter && (
                <div className="space-y-2">
                  <Label htmlFor="child-meter">
                    Current {selectedTypeForAdd.meterUnit} (optional)
                  </Label>
                  <Input
                    id="child-meter"
                    name="meterValue"
                    type="number"
                    placeholder="0"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="child-notes">Notes (optional)</Label>
                <Textarea id="child-notes" name="notes" rows={2} />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddChildDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
