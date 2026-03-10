import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/actions";
import { db, taskHistory } from "@/db";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetIcon } from "@/components/shared/asset-icon";
import { CheckCircle, Calendar, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function HistoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const history = await db.query.taskHistory.findMany({
    where: eq(taskHistory.ownerId, user.id),
    orderBy: [desc(taskHistory.completedAt)],
    limit: 100,
    with: {
      asset: {
        with: {
          assetType: true,
        },
      },
    },
  });

  // Group by date
  const groupedHistory: Record<string, typeof history> = {};
  history.forEach((item) => {
    const date = new Date(item.completedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groupedHistory[date]) {
      groupedHistory[date] = [];
    }
    groupedHistory[date].push(item);
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Task History</h1>
        <p className="text-muted-foreground">
          View all completed maintenance tasks
        </p>
      </div>

      {history.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No history yet</h3>
            <p className="text-muted-foreground">
              Completed tasks will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                {date}
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <Link key={item.id} href={`/assets/${item.asset.id}/history`}>
                    <Card className="transition-all hover:shadow-md hover:border-primary/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-completed/10 p-2">
                            <CheckCircle className="h-5 w-5 text-completed" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <AssetIcon
                                    iconSlug={item.asset.assetType.iconSlug}
                                    size="sm"
                                    className="h-5 w-5 p-0.5"
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {item.asset.name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.meterAtCompletion && (
                                  <Badge variant="secondary">
                                    {item.meterAtCompletion.toLocaleString()}
                                  </Badge>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                            {item.notes && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
