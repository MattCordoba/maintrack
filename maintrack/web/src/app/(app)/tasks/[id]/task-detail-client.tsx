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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetIcon } from "@/components/shared/asset-icon";
import {
  ArrowLeft,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Pencil,
  Calendar,
  Repeat,
  Gauge,
  History,
  Upload,
  Camera,
} from "lucide-react";
import { formatDate, formatRelativeDate, getDaysUntilDue } from "@/lib/utils";
import { completeTask, postponeTask, cancelTask, updateTask } from "../actions";

interface TaskFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

interface Asset {
  id: string;
  name: string;
  meterValue: number | null;
  meterUnit: string | null;
  assetType: {
    iconSlug: string;
    name: string;
  };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  taskType: string;
  category: string;
  intervalValue: number | null;
  intervalUnit: string | null;
  cycleInterval: number | null;
  cycleUnit: string | null;
  dueDate: Date | null;
  postponedTo: Date | null;
  lastCompletedAt: Date | null;
  lastCompletedMeter: number | null;
  isFromTemplate: boolean;
  asset: Asset;
  files?: TaskFile[];
}

interface HistoryItem {
  id: string;
  title: string;
  completedAt: Date;
  notes: string | null;
  meterAtCompletion: number | null;
  photoUrl: string | null;
}

interface TaskDetailClientProps {
  task: Task;
  history: HistoryItem[];
}

export function TaskDetailClient({ task, history }: TaskDetailClientProps) {
  const router = useRouter();
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isPostponeDialogOpen, setIsPostponeDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysUntilDue = task.dueDate ? getDaysUntilDue(task.dueDate) : null;
  const showMeterInput = task.taskType === "cycle_based" && task.asset.meterUnit;

  const getStatusBadge = () => {
    if (task.postponedTo) {
      return <Badge variant="secondary">Postponed</Badge>;
    }
    switch (task.status) {
      case "overdue":
        return <Badge variant="overdue">Overdue</Badge>;
      case "due_soon":
        return <Badge variant="dueSoon">Due Soon</Badge>;
      case "scheduled":
        return <Badge variant="scheduled">Scheduled</Badge>;
      case "completed":
        return <Badge variant="completed">Completed</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      safety: "Safety",
      preventative: "Preventative",
      routine: "Routine",
      festive: "Festive",
      regulatory: "Regulatory",
    };
    return labels[category] || category;
  };

  const getIntervalLabel = () => {
    if (task.taskType === "one_time") return "One-time task";
    if (task.taskType === "cycle_based" && task.cycleInterval && task.cycleUnit) {
      return `Every ${task.cycleInterval.toLocaleString()} ${task.cycleUnit}`;
    }
    if (task.intervalValue && task.intervalUnit) {
      const unitLabels: Record<string, string> = {
        day: task.intervalValue === 1 ? "day" : "days",
        week: task.intervalValue === 1 ? "week" : "weeks",
        month: task.intervalValue === 1 ? "month" : "months",
        year: task.intervalValue === 1 ? "year" : "years",
      };
      return `Every ${task.intervalValue} ${unitLabels[task.intervalUnit]}`;
    }
    return "No interval set";
  };

  const handleComplete = async (formData: FormData) => {
    setIsSubmitting(true);
    await completeTask(task.id, formData);
    setIsCompleteDialogOpen(false);
    setIsSubmitting(false);
    router.refresh();
  };

  const handlePostpone = async (formData: FormData) => {
    setIsSubmitting(true);
    const dateStr = formData.get("postponeDate") as string;
    await postponeTask(task.id, new Date(dateStr));
    setIsPostponeDialogOpen(false);
    setIsSubmitting(false);
    router.refresh();
  };

  const handleCancel = async () => {
    setIsSubmitting(true);
    await cancelTask(task.id);
    setIsCancelDialogOpen(false);
    setIsSubmitting(false);
    router.push("/tasks");
  };

  const handleEdit = async (formData: FormData) => {
    setIsSubmitting(true);
    await updateTask(task.id, formData);
    setIsEditDialogOpen(false);
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:relative md:border-0 md:bg-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href="/tasks">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{task.title}</h1>
              <Link
                href={`/assets/${task.asset.id}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {task.asset.name}
              </Link>
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
              <DropdownMenuItem onClick={() => setIsPostponeDialogOpen(true)}>
                <Clock className="h-4 w-4 mr-2" />
                Postpone
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsCancelDialogOpen(true)}
                className="text-destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 space-y-6 pb-24 md:pb-6">
        {/* Status Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AssetIcon iconSlug={task.asset.assetType.iconSlug} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge()}
                    <Badge variant="outline">{getCategoryLabel(task.category)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.dueDate
                      ? task.postponedTo
                        ? `Postponed to ${formatDate(task.postponedTo)}`
                        : formatRelativeDate(task.dueDate)
                      : "No due date"}
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsCompleteDialogOpen(true)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Repeat className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Interval</p>
                <p className="font-medium">{getIntervalLabel()}</p>
              </div>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDate(task.dueDate)}</p>
                </div>
              </div>
            )}

            {task.lastCompletedAt && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Completed</p>
                  <p className="font-medium">
                    {formatDate(task.lastCompletedAt)}
                    {task.lastCompletedMeter && task.asset.meterUnit && (
                      <span className="text-muted-foreground">
                        {" "}
                        at {task.lastCompletedMeter.toLocaleString()}{" "}
                        {task.asset.meterUnit}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {task.asset.meterValue && task.asset.meterUnit && (
              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current {task.asset.meterUnit}
                  </p>
                  <p className="font-medium">
                    {task.asset.meterValue.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {task.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Completed</p>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.completedAt)}
                    </span>
                  </div>
                  {item.meterAtCompletion && task.asset.meterUnit && (
                    <p className="text-sm text-muted-foreground">
                      At {item.meterAtCompletion.toLocaleString()} {task.asset.meterUnit}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-sm mt-2">{item.notes}</p>
                  )}
                  {item.photoUrl && (
                    <a href={item.photoUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={item.photoUrl}
                        alt="Completion photo"
                        className="mt-2 rounded-lg max-w-xs"
                      />
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Complete Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Mark "{task.title}" as complete
            </DialogDescription>
          </DialogHeader>
          <form action={handleComplete} className="space-y-4">
            {showMeterInput && (
              <div className="space-y-2">
                <Label htmlFor="meterValue">
                  Current {task.asset.meterUnit} *
                </Label>
                <Input
                  id="meterValue"
                  name="meterValue"
                  type="number"
                  defaultValue={task.asset.meterValue || 0}
                  min={task.asset.meterValue || 0}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any notes about this completion..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Photo (optional)</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button type="button" variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Photo upload will be available after connecting storage
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCompleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Completing..." : "Mark Complete"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Postpone Dialog */}
      <Dialog open={isPostponeDialogOpen} onOpenChange={setIsPostponeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Postpone Task</DialogTitle>
            <DialogDescription>
              Choose a new date for this task
            </DialogDescription>
          </DialogHeader>
          <form action={handlePostpone} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postponeDate">New Due Date</Label>
              <Input
                id="postponeDate"
                name="postponeDate"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPostponeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Postponing..." : "Postpone"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this task? It will be removed from
              your task list but preserved in history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Keep Task
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cancelling..." : "Cancel Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={task.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select name="category" defaultValue={task.category}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="preventative">Preventative</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="festive">Festive</SelectItem>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {task.taskType === "time_based" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-intervalValue">Interval</Label>
                  <Input
                    id="edit-intervalValue"
                    name="intervalValue"
                    type="number"
                    defaultValue={task.intervalValue || ""}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-intervalUnit">Unit</Label>
                  <Select
                    name="intervalUnit"
                    defaultValue={task.intervalUnit || "month"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Days</SelectItem>
                      <SelectItem value="week">Weeks</SelectItem>
                      <SelectItem value="month">Months</SelectItem>
                      <SelectItem value="year">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                name="dueDate"
                type="date"
                defaultValue={
                  task.dueDate
                    ? new Date(task.dueDate).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Notes</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={task.description || ""}
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
