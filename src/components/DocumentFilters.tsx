import { useState } from "react";
import { FilterCheckbox } from "./FilterCheckbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Filter, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface DocumentFiltersProps {
  onFiltersChange: (filters: Record<string, boolean>) => void;
  hideHeader?: boolean;
  documents: Document[];
  isLoading: boolean;
  onRefresh: () => void;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

interface Document {
  filename?: string;
  source?: string;
  id?: string;
  url?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export const DocumentFilters = ({ 
  onFiltersChange, 
  hideHeader = false, 
  documents, 
  isLoading, 
  onRefresh,
  isConnected,
  onConnect,
  onDisconnect 
}: DocumentFiltersProps) => {
  const [isExpanded] = useState(true);
  const [filters, setFilters] = useState<Record<string, boolean>>({});

  // Extract unique filenames and sources from documents
  const uniqueFilenames = Array.from(
    new Set(documents.map((doc) => doc.filename).filter((f): f is string => !!f)),
  ).sort();

  const uniqueSources = Array.from(
    new Set(documents.map((doc) => doc.source || "Unknown").filter((s): s is string => !!s)),
  ).sort();

  const handleFilterToggle = (filterKey: string) => {
    const newFilters = {
      ...filters,
      [filterKey]: !filters[filterKey],
    };
    setFilters(newFilters);

    // Convert to Airweave filter format
    const activeFilters: Record<string, boolean> = {};
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) {
        activeFilters[key] = true;
      }
    });

    onFiltersChange(activeFilters);
  };

  const textColorClass = hideHeader ? "text-foreground" : "text-sidebar-foreground";

  const content = (
    <div className={`space-y-6 ${hideHeader ? "p-6" : ""}`}>
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Đang tải danh sách tài liệu...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Filename filters */}
          {uniqueFilenames.length > 0 && (
            <div className="space-y-3">
              <h3 className={`text-sm font-semibold ${textColorClass}`}>Tên Tệp ({uniqueFilenames.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uniqueFilenames.map((filename) => {
                  // Find document with this filename to get URL
                  const doc = documents.find((d) => d.filename === filename);
                  const docUrl = doc?.url || doc?.link;

                  return (
                    <div key={filename} className="flex items-center justify-between group">
                      <FilterCheckbox
                        label={filename}
                        checked={filters[`filename:${filename}`] || false}
                        onCheckedChange={() => handleFilterToggle(`filename:${filename}`)}
                      />
                      {docUrl && (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                          onClick={(e) => e.stopPropagation()}
                          title="Mở tài liệu"
                        >
                          <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Source filters */}
          {uniqueSources.length > 0 && (
            <div className="space-y-3">
              <h3 className={`text-sm font-semibold ${textColorClass}`}>Nguồn ({uniqueSources.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uniqueSources.map((source) => (
                  <FilterCheckbox
                    key={source}
                    label={source}
                    checked={filters[`source:${source}`] || false}
                    onCheckedChange={() => handleFilterToggle(`source:${source}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {uniqueFilenames.length === 0 && uniqueSources.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Không tìm thấy tài liệu nào trong collection.
            </div>
          )}

          {/* Clear filters button */}
          {Object.keys(filters).some((key) => filters[key]) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({});
                onFiltersChange({});
              }}
              className="w-full"
            >
              Xóa Tất Cả Bộ Lọc
            </Button>
          )}
        </>
      )}
    </div>
  );

  if (hideHeader) {
    return content;
  }

  return (
    <Card className="h-full border-0 bg-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-sidebar-foreground" />
            <CardTitle className="text-lg text-sidebar-foreground">Bộ Lọc Tài Liệu</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="h-8 text-xs"
              >
                Ngắt GDrive
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onConnect}
                className="h-8 text-xs"
              >
                Kết nối GDrive
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && <CardContent className="space-y-6">{content}</CardContent>}
    </Card>
  );
};
