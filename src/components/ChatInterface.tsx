import { useState } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { DocumentFilters } from "./DocumentFilters";
import { UploadDocument } from "./UploadDocument";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Source {
  filename?: string;
  source?: string;
  content?: string;
  url?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  const handleFiltersChange = (newFilters: Record<string, boolean>) => {
    setFilters(newFilters);
  };

  const handleUploadSuccess = () => {
    // Trigger refresh of document list
    setRefreshDocuments((prev) => prev + 1);
    toast.success("Tài liệu đã được upload và đang được xử lý. Bạn có thể hỏi về tài liệu này ngay bây giờ!");
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call edge function with query and filters
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          query: content.trim(),
          filters: filters
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Không thể kết nối với server. Vui lòng thử lại.");
        setIsLoading(false);
        return;
      }

      // Add assistant response with sources
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeFiltersCount = Object.keys(filters).filter(key => filters[key]).length;

  return (
    <div className="flex h-full bg-background">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile filter button */}
        <div className="lg:hidden border-b border-border p-2 flex justify-between items-center gap-2">
          <h2 className="text-lg font-semibold">Chat</h2>
          <div className="flex items-center gap-2">
            <UploadDocument onUploadSuccess={handleUploadSuccess} />
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Bộ Lọc Tài Liệu</SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-4rem)] overflow-y-auto">
                <DocumentFilters 
                  onFiltersChange={handleFiltersChange} 
                  hideHeader 
                  refreshTrigger={refreshDocuments}
                />
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>

        {/* Desktop header with upload button */}
        <div className="hidden lg:flex border-b border-border p-3 justify-end">
          <UploadDocument onUploadSuccess={handleUploadSuccess} />
        </div>

        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} isLoading={isLoading} />
        </div>
        <div className="border-t border-border bg-card">
          <MessageInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
      
      {/* Document filters sidebar - Desktop */}
      <div className="w-80 border-l border-border hidden lg:block">
        <DocumentFilters 
          onFiltersChange={handleFiltersChange} 
          refreshTrigger={refreshDocuments}
        />
      </div>
    </div>
  );
};
