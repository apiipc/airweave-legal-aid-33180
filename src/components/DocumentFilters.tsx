import { useState, useEffect } from "react";
import { FilterCheckbox } from "./FilterCheckbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Filter, Loader2, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "./ui/alert";

interface DocumentFiltersProps {
  onFiltersChange: (filters: Record<string, boolean>) => void;
  hideHeader?: boolean;
  refreshTrigger?: number;
}

interface Document {
  filename?: string;
  source?: string;
  id?: string;
  url?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export const DocumentFilters = ({ onFiltersChange, hideHeader = false, refreshTrigger = 0 }: DocumentFiltersProps) => {
  const [isExpanded] = useState(true);
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke('list-documents');

      if (fetchError) {
        console.error("Error fetching documents:", fetchError);
        
        // Provide more specific error messages
        let errorMessage = "Không thể tải danh sách tài liệu. ";
        if (fetchError.message?.includes("Function not found") || fetchError.message?.includes("404")) {
          errorMessage += "Edge function chưa được deploy. Vui lòng deploy function 'list-documents'.";
        } else if (fetchError.message?.includes("401") || fetchError.message?.includes("403")) {
          errorMessage += "Lỗi xác thực. Vui lòng đăng nhập lại.";
        } else {
          errorMessage += "Vui lòng thử lại sau.";
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (data?.documents) {
        setDocuments(data.documents);
      } else {
        setError("Không tìm thấy tài liệu nào.");
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Đã xảy ra lỗi khi tải danh sách tài liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]); // Refresh when refreshTrigger changes

  // Extract unique filenames and sources from documents
  const uniqueFilenames = Array.from(
    new Set(documents.map((doc) => doc.filename).filter((f): f is string => !!f))
  ).sort();

  const uniqueSources = Array.from(
    new Set(documents.map((doc) => doc.source || "Unknown").filter((s): s is string => !!s))
  ).sort();

  const handleFilterToggle = (filterKey: string) => {
    const newFilters = {
      ...filters,
      [filterKey]: !filters[filterKey],
    };
    setFilters(newFilters);
    
    // Convert to Airweave filter format
    const activeFilters: Record<string, boolean> = {};
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        activeFilters[key] = true;
      }
    });
    
    onFiltersChange(activeFilters);
  };

  const textColorClass = hideHeader ? 'text-foreground' : 'text-sidebar-foreground';
  
  const content = (
    <div className={`space-y-6 ${hideHeader ? 'p-6' : ''}`}>
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Đang tải danh sách tài liệu...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mx-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <>
          {/* Filename filters */}
          {uniqueFilenames.length > 0 && (
            <div className="space-y-3">
              <h3 className={`text-sm font-semibold ${textColorClass}`}>
                Tên Tệp ({uniqueFilenames.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uniqueFilenames.map((filename) => {
                  // Find document with this filename to get URL
                  const doc = documents.find(d => d.filename === filename);
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
              <h3 className={`text-sm font-semibold ${textColorClass}`}>
                Nguồn ({uniqueSources.length})
              </h3>
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
          {Object.keys(filters).some(key => filters[key]) && (
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
    <Card className="h-full border-l border-sidebar-border bg-sidebar">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-sidebar-foreground" />
            <CardTitle className="text-lg text-sidebar-foreground">Bộ Lọc Tài Liệu</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDocuments}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {content}
        </CardContent>
      )}
    </Card>
  );
};
