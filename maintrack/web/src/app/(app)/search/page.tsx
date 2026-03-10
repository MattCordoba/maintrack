"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetIcon } from "@/components/shared/asset-icon";
import { Search, X, ChevronRight, Clock } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

interface SearchResult {
  type: "task" | "asset";
  id: string;
  title: string;
  subtitle: string;
  status?: string;
  iconSlug: string;
  assetId?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("maintrack_recent_searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("maintrack_recent_searches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("maintrack_recent_searches");
  };

  const search = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    saveRecentSearch(query);

    try {
      const params = new URLSearchParams({
        q: query,
        status: statusFilter,
        type: typeFilter,
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, statusFilter, typeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, statusFilter, typeFilter, search]);

  const getStatusBadge = (status?: string) => {
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
    <div className="p-4 md:p-6 space-y-4">
      {/* Search Input */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks, assets, notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="due_soon">Due Soon</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="asset">Assets</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Searches
            </h3>
            <Button variant="ghost" size="sm" onClick={clearRecentSearches}>
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(search)}
              >
                {search}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="text-center py-8 text-muted-foreground">
          Searching...
        </div>
      )}

      {/* No Results */}
      {!isSearching && query && results.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!isSearching && results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={
                result.type === "task"
                  ? `/tasks/${result.id}`
                  : `/assets/${result.id}`
              }
            >
              <Card className="transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AssetIcon iconSlug={result.iconSlug} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.status && getStatusBadge(result.status)}
                      <Badge variant="outline">
                        {result.type === "task" ? "Task" : "Asset"}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!query && recentSearches.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Search MainTrack</h3>
            <p className="text-muted-foreground">
              Find tasks, assets, and notes across your entire account
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
