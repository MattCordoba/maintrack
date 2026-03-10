import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/actions";
import { db, assets, taskHistory, meterReadings } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetIcon } from "@/components/shared/asset-icon";
import { ArrowLeft, CheckCircle, Gauge, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export default async function AssetHistoryPage({ params }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const asset = await db.query.assets.findFirst({
    where: and(eq(assets.id, params.id), eq(assets.ownerId, user.id)),
    with: {
      assetType: true,
    },
  });

  if (!asset) {
    notFound();
  }

  // Get task history
  const history = await db.query.taskHistory.findMany({
    where: eq(taskHistory.assetId, asset.id),
    orderBy: [desc(taskHistory.completedAt)],
  });

  // Get meter readings
  const readings = await db.query.meterReadings.findMany({
    where: eq(meterReadings.assetId, asset.id),
    orderBy: [desc(meterReadings.recordedAt)],
  });

  // Combine and sort by date
  type HistoryItem =
    | { type: "task"; data: (typeof history)[0]; date: Date }
    | { type: "meter"; data: (typeof readings)[0]; date: Date };

  const combinedHistory: HistoryItem[] = [
    ...history.map((h) => ({
      type: "task" as const,
      data: h,
      date: new Date(h.completedAt),
    })),
    ...readings.map((r) => ({
      type: "meter" as const,
      data: r,
      date: new Date(r.recordedAt),
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

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
            <h1 className="text-xl font-bold">History</h1>
            <p className="text-sm text-muted-foreground">{asset.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
        {combinedHistory.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No history yet</h3>
              <p className="text-muted-foreground">
                Completed tasks and meter readings will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {combinedHistory.map((item, index) => {
              if (item.type === "task") {
                return (
                  <Card key={`task-${item.data.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-completed/10 p-2">
                          <CheckCircle className="h-5 w-5 text-completed" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{item.data.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Completed {formatDate(item.data.completedAt)}
                              </p>
                            </div>
                            {item.data.meterAtCompletion && (
                              <Badge variant="secondary">
                                {item.data.meterAtCompletion.toLocaleString()}{" "}
                                {asset.meterUnit}
                              </Badge>
                            )}
                          </div>
                          {item.data.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {item.data.notes}
                            </p>
                          )}
                          {item.data.photoUrl && (
                            <a
                              href={item.data.photoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 block"
                            >
                              <img
                                src={item.data.photoUrl}
                                alt="Completion photo"
                                className="rounded-lg max-w-xs"
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              } else {
                return (
                  <Card key={`meter-${item.data.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Gauge className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                Meter updated to{" "}
                                {item.data.value.toLocaleString()} {asset.meterUnit}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(item.data.recordedAt)}
                              </p>
                            </div>
                          </div>
                          {item.data.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {item.data.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
