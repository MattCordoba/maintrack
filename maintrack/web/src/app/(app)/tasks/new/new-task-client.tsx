"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetIcon } from "@/components/shared/asset-icon";
import { ArrowLeft } from "lucide-react";
import { createTask } from "../actions";

interface Asset {
  id: string;
  name: string;
  meterValue: number | null;
  meterUnit: string | null;
  assetType: {
    id: string;
    name: string;
    iconSlug: string;
    hasMeter: boolean;
    meterUnit: string | null;
  };
}

interface NewTaskClientProps {
  asset: Asset;
}

export function NewTaskClient({ asset }: NewTaskClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskType, setTaskType] = useState<string>("time_based");

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    formData.append("assetId", asset.id);
    await createTask(formData);
    setIsSubmitting(false);
    router.push(`/assets/${asset.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:relative md:border-0 md:bg-transparent">
        <div className="flex items-center gap-3 p-4">
          <Link href={`/assets/${asset.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Add Task</h1>
            <p className="text-sm text-muted-foreground">{asset.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <AssetIcon iconSlug={asset.assetType.iconSlug} size="lg" />
              <div>
                <CardTitle>{asset.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {asset.assetType.name}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Oil Change, Filter Replacement"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskType">Task Type *</Label>
                <Select
                  name="taskType"
                  value={taskType}
                  onValueChange={setTaskType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_based">
                      Time-based (recurring)
                    </SelectItem>
                    {asset.assetType.hasMeter && (
                      <SelectItem value="cycle_based">
                        Cycle-based (by {asset.assetType.meterUnit})
                      </SelectItem>
                    )}
                    <SelectItem value="one_time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue="routine">
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

              {taskType === "time_based" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="intervalValue">Repeat Every *</Label>
                    <Input
                      id="intervalValue"
                      name="intervalValue"
                      type="number"
                      min={1}
                      defaultValue={1}
                      required
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
              )}

              {taskType === "cycle_based" && asset.assetType.hasMeter && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cycleInterval">
                      Every ({asset.assetType.meterUnit}) *
                    </Label>
                    <Input
                      id="cycleInterval"
                      name="cycleInterval"
                      type="number"
                      min={1}
                      placeholder="e.g., 5000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cycleUnit">Unit</Label>
                    <Input
                      id="cycleUnit"
                      name="cycleUnit"
                      value={asset.assetType.meterUnit || ""}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              )}

              {taskType === "one_time" && (
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Notes (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add any notes or instructions..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
