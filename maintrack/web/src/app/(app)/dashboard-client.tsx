"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Plus, AlertTriangle, Clock, Calendar, CheckCircle } from "lucide-react";
import { formatRelativeDate, getDaysUntilDue } from "@/lib/utils";
import { AssetIcon } from "@/components/shared/asset-icon";

interface TaskCounts {
  overdue: number;
  dueSoon: number;
  scheduled: number;
  oneTime: number;
  total: number;
}

interface TaskWithAsset {
  id: string;
  title: string;
  status: string;
  taskType: string;
  dueDate: Date | null;
  asset: {
    id: string;
    name: string;
    assetType: {
      iconSlug: string;
      name: string;
    };
  };
}

interface HistoryItem {
  id: string;
  title: string;
  completedAt: Date;
  asset: {
    id: string;
    name: string;
    assetType: {
      iconSlug: string;
      name: string;
    };
  };
}

interface DashboardClientProps {
  userName: string;
  taskCounts: TaskCounts;
  overdueTasks: TaskWithAsset[];
  dueSoonTasks: TaskWithAsset[];
  oneTimeTasks: TaskWithAsset[];
  recentHistory: HistoryItem[];
  assetCount: number;
}

export function DashboardClient({
  userName,
  taskCounts,
  overdueTasks,
  dueSoonTasks,
  oneTimeTasks,
  recentHistory,
  assetCount,
}: DashboardClientProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const chartData = [
    { name: "Overdue", value: taskCounts.overdue, color: "#EF4444" },
    { name: "Due Soon", value: taskCounts.dueSoon, color: "#F59E0B" },
    { name: "Scheduled", value: taskCounts.scheduled, color: "#3B82F6" },
    { name: "One-Time", value: taskCounts.oneTime, color: "#8B5CF6" },
  ].filter((item) => item.value > 0);

  const hasNoAssets = assetCount === 0;
  const hasNoTasks = taskCounts.total === 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-muted-foreground">
          {taskCounts.overdue > 0
            ? `You have ${taskCounts.overdue} overdue task${taskCounts.overdue > 1 ? "s" : ""}`
            : "All caught up on maintenance!"}
        </p>
      </div>

      {/* Empty State */}
      {hasNoAssets && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No assets yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Add your first asset to start tracking maintenance tasks
            </p>
            <Link href="/assets">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add your first asset
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Donut Chart */}
      {!hasNoAssets && !hasNoTasks && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Task Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{taskCounts.total}</span>
                  <span className="text-xs text-muted-foreground">Tasks</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {chartData.map((item) => (
                  <Link
                    key={item.name}
                    href={`/tasks?status=${item.name.toLowerCase().replace(" ", "_")}`}
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>
                      {item.name}: {item.value}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <Card className="border-overdue/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-overdue" />
                <CardTitle className="text-lg">Overdue</CardTitle>
              </div>
              <Link href="/tasks?status=overdue">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.map((task) => (
              <TaskCard key={task.id} task={task} variant="overdue" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Due Soon Tasks */}
      {dueSoonTasks.length > 0 && (
        <Card className="border-due-soon/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-due-soon" />
                <CardTitle className="text-lg">Due Soon</CardTitle>
              </div>
              <Link href="/tasks?status=due_soon">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {dueSoonTasks.map((task) => (
              <TaskCard key={task.id} task={task} variant="dueSoon" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* One-Time Tasks */}
      {oneTimeTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-one-time" />
                <CardTitle className="text-lg">One-Time Tasks</CardTitle>
              </div>
              <Link href="/tasks?type=one_time">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {oneTimeTasks.map((task) => (
              <TaskCard key={task.id} task={task} variant="oneTime" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent History */}
      {recentHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-completed" />
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </div>
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentHistory.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TaskCard({
  task,
  variant,
}: {
  task: TaskWithAsset;
  variant: "overdue" | "dueSoon" | "oneTime";
}) {
  const daysUntilDue = task.dueDate ? getDaysUntilDue(task.dueDate) : 0;

  const badgeVariant =
    variant === "overdue"
      ? "overdue"
      : variant === "dueSoon"
        ? "dueSoon"
        : "oneTime";

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
    >
      <AssetIcon iconSlug={task.asset.assetType.iconSlug} className="h-8 w-8" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{task.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {task.asset.name}
        </p>
      </div>
      <Badge variant={badgeVariant}>
        {variant === "overdue"
          ? `${Math.abs(daysUntilDue)}d overdue`
          : variant === "dueSoon"
            ? `${daysUntilDue}d`
            : task.dueDate
              ? formatRelativeDate(task.dueDate)
              : "No date"}
      </Badge>
    </Link>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  return (
    <Link
      href={`/assets/${item.asset.id}/history`}
      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
    >
      <AssetIcon iconSlug={item.asset.assetType.iconSlug} className="h-8 w-8" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {item.asset.name}
        </p>
      </div>
      <span className="text-sm text-muted-foreground">
        {formatRelativeDate(item.completedAt)}
      </span>
    </Link>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
