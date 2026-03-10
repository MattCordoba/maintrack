"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FAB } from "@/components/shared/fab";
import { AssetIcon } from "@/components/shared/asset-icon";
import {
  Plus,
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Pencil,
  ChevronRight,
} from "lucide-react";
import { formatRelativeDate, getDaysUntilDue } from "@/lib/utils";
import { createTask } from "./actions";

interface AssetType {
  iconSlug: string;
  name: string;
}

interface Asset {
  id: string;
  name: string;
  assetType: AssetType;
}

interface Task {
  id: string;
  title: string;
  status: string;
  taskType: string;
  dueDate: Date | null;
  category: string;
  postponedTo: Date | null;
  asset: Asset;
}

interface TasksClientProps {
  tasks: Task[];
  assets: Asset[];
  initialStatusFilter: string;
  initialTypeFilter: string;
}

export function TasksClient({
  tasks,
  assets,
  initialStatusFilter,
  initialTypeFilter,
}: TasksClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [typeFilter, setTypeFilter] = useState(initialTypeFilter);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.asset.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      task.status === statusFilter ||
      (statusFilter === "postponed" && task.postponedTo);

    const matchesType =
      typeFilter === "all" || task.taskType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Group tasks by status
  const overdueTasks = filteredTasks.filter((t) => t.status === "overdue");
  const dueSoonTasks = filteredTasks.filter((t) => t.status === "due_soon");
  const scheduledTasks = filteredTasks.filter((t) => t.status === "scheduled");
  const postponedTasks = filteredTasks.filter((t) => t.postponedTo);

  const handleCreateTask = async (formData: FormData) => {
    setIsSubmitting(true);
    await createTask(formData);
    setIsAddDialogOpen(false);
    setSelectedAsset(null);
    setIsSubmitting(false);
  };

  const getStatusBadge = (task: Task) => {
    if (task.postponedTo) {
      return (
        <Badge variant="secondary">
          Postponed to {formatRelativeDate(task.postponedTo)}
        </Badge>
      );
    }
    switch (task.status) {
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
    <div className="p-4 md:p-6 space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="due_soon">Due Soon</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="time_based">Time-Based</SelectItem>
              <SelectItem value="cycle_based">Cycle-Based</SelectItem>
              <SelectItem value="one_time">One-Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "No tasks found"
                : "No tasks yet"}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Add assets to get started with maintenance tracking"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      {filteredTasks.length > 0 && (
        <div className="space-y-6">
          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-overdue" />
                Overdue ({overdueTasks.length})
              </h2>
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Due Soon */}
          {dueSoonTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-due-soon" />
                Due Soon ({dueSoonTasks.length})
              </h2>
              <div className="space-y-2">
                {dueSoonTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Scheduled */}
          {scheduledTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-scheduled" />
                Scheduled ({scheduledTasks.length})
              </h2>
              <div className="space-y-2">
                {scheduledTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Postponed */}
          {postponedTasks.length > 0 && statusFilter === "postponed" && (
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                Postponed ({postponedTasks.length})
              </h2>
              <div className="space-y-2">
                {postponedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <FAB onClick={() => setIsAddDialogOpen(true)} label="Add task" />

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Create a new maintenance task
            </DialogDescription>
          </DialogHeader>

          {!selectedAsset ? (
            <div className="space-y-4">
              <Label>Select Asset</Label>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {assets.map((asset) => (
                    <Button
                      key={asset.id}
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto p-3"
                      onClick={() => setSelectedAsset(asset.id)}
                    >
                      <AssetIcon iconSlug={asset.assetType.iconSlug} size="sm" />
                      <div className="text-left">
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.assetType.name}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <form action={handleCreateTask} className="space-y-4">
              <input type="hidden" name="assetId" value={selectedAsset} />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit -mt-2"
                onClick={() => setSelectedAsset(null)}
              >
                ← Change asset
              </Button>

              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Oil Change"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskType">Task Type *</Label>
                <Select name="taskType" defaultValue="time_based">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_based">
                      Time-Based (e.g., every 6 months)
                    </SelectItem>
                    <SelectItem value="cycle_based">
                      Cycle-Based (e.g., every 5,000 km)
                    </SelectItem>
                    <SelectItem value="one_time">One-Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue="preventative">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="intervalValue">Interval</Label>
                  <Input
                    id="intervalValue"
                    name="intervalValue"
                    type="number"
                    placeholder="e.g., 6"
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intervalUnit">Unit</Label>
                  <Select name="intervalUnit" defaultValue="month">
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

              <div className="space-y-2">
                <Label htmlFor="dueDate">First Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Notes (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add any notes..."
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedAsset(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const daysUntilDue = task.dueDate ? getDaysUntilDue(task.dueDate) : null;

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AssetIcon iconSlug={task.asset.assetType.iconSlug} />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{task.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {task.asset.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {task.status === "overdue" && daysUntilDue !== null && (
                <Badge variant="overdue">
                  {Math.abs(daysUntilDue)}d overdue
                </Badge>
              )}
              {task.status === "due_soon" && daysUntilDue !== null && (
                <Badge variant="dueSoon">{daysUntilDue}d</Badge>
              )}
              {task.status === "scheduled" && task.dueDate && (
                <span className="text-sm text-muted-foreground">
                  {formatRelativeDate(task.dueDate)}
                </span>
              )}
              {task.postponedTo && (
                <Badge variant="secondary">
                  Postponed
                </Badge>
              )}
              {task.taskType === "one_time" && (
                <Badge variant="oneTime">One-Time</Badge>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
