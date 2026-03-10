"use client";

import { useState } from "react";
import Link from "next/link";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FAB } from "@/components/shared/fab";
import { AssetIcon } from "@/components/shared/asset-icon";
import { Plus, Search, Filter, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetCategory } from "@/types";
import { createAsset } from "./actions";

interface AssetType {
  id: string;
  name: string;
  category: AssetCategory;
  iconSlug: string;
  hasMeter: boolean;
  meterUnit: string | null;
}

interface Asset {
  id: string;
  name: string;
  assetType: AssetType;
  overdueCount: number;
  childAssets?: Asset[];
}

interface Category {
  id: AssetCategory;
  name: string;
  icon: string;
  emoji: string;
}

interface AssetsClientProps {
  assets: Asset[];
  assetTypes: AssetType[];
  categories: Category[];
}

export function AssetsClient({ assets, assetTypes, categories }: AssetsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addStep, setAddStep] = useState<"category" | "type" | "details">("category");
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState<AssetCategory | null>(null);
  const [selectedTypeForAdd, setSelectedTypeForAdd] = useState<AssetType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      asset.assetType.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategorySelect = (category: AssetCategory) => {
    setSelectedCategoryForAdd(category);
    setAddStep("type");
  };

  const handleTypeSelect = (type: AssetType) => {
    setSelectedTypeForAdd(type);
    setAddStep("details");
  };

  const handleCreateAsset = async (formData: FormData) => {
    if (!selectedTypeForAdd) return;
    setIsSubmitting(true);

    formData.append("assetTypeId", selectedTypeForAdd.id);

    await createAsset(formData);

    setIsAddDialogOpen(false);
    setAddStep("category");
    setSelectedCategoryForAdd(null);
    setSelectedTypeForAdd(null);
    setIsSubmitting(false);
  };

  const resetAddDialog = () => {
    setAddStep("category");
    setSelectedCategoryForAdd(null);
    setSelectedTypeForAdd(null);
  };

  const typesForCategory = assetTypes.filter(
    (t) => t.category === selectedCategoryForAdd
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || selectedCategory !== "all"
                ? "No assets found"
                : "No assets yet"}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first asset to start tracking maintenance"}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add asset
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Asset Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map((asset) => (
          <Link key={asset.id} href={`/assets/${asset.id}`}>
            <Card className="transition-all hover:shadow-md hover:border-primary/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AssetIcon iconSlug={asset.assetType.iconSlug} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{asset.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {asset.assetType.name}
                        </p>
                      </div>
                      {asset.overdueCount > 0 && (
                        <Badge variant="overdue">{asset.overdueCount}</Badge>
                      )}
                    </div>
                    {asset.childAssets && asset.childAssets.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {asset.childAssets.length} sub-asset
                        {asset.childAssets.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* FAB */}
      <FAB onClick={() => setIsAddDialogOpen(true)} label="Add asset" />

      {/* Add Asset Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetAddDialog();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {addStep === "category" && "Select Category"}
              {addStep === "type" && "Select Asset Type"}
              {addStep === "details" && "Asset Details"}
            </DialogTitle>
            <DialogDescription>
              {addStep === "category" && "Choose a category for your asset"}
              {addStep === "type" && "Choose the type of asset"}
              {addStep === "details" && "Enter the details for your asset"}
            </DialogDescription>
          </DialogHeader>

          {/* Category Selection */}
          {addStep === "category" && (
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
          {addStep === "type" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -mt-2"
                onClick={() => setAddStep("category")}
              >
                ← Back to categories
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
                      <div className="text-left">
                        <div className="font-medium">{type.name}</div>
                        {type.hasMeter && (
                          <div className="text-xs text-muted-foreground">
                            Tracks {type.meterUnit}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          {/* Asset Details Form */}
          {addStep === "details" && selectedTypeForAdd && (
            <form action={handleCreateAsset} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit -mt-2"
                onClick={() => setAddStep("type")}
              >
                ← Back to types
              </Button>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <AssetIcon iconSlug={selectedTypeForAdd.iconSlug} />
                <div>
                  <div className="font-medium">{selectedTypeForAdd.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {categories.find((c) => c.id === selectedTypeForAdd.category)?.name}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={`My ${selectedTypeForAdd.name}`}
                  required
                />
              </div>

              {selectedTypeForAdd.hasMeter && (
                <div className="space-y-2">
                  <Label htmlFor="meterValue">
                    Current {selectedTypeForAdd.meterUnit} (optional)
                  </Label>
                  <Input
                    id="meterValue"
                    name="meterValue"
                    type="number"
                    placeholder="0"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add any notes about this asset..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Asset"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
