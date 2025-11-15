import { useState, useEffect } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { DocumentFilters } from "./DocumentFilters";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Filter, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useNavigate } from "react-router-dom";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";

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
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [useGoogleDriveFiles, setUseGoogleDriveFiles] = useState(false);
  
  const { isConnected, connect, disconnect, listFiles } = useGoogleDrive();

  const CACHE_KEY = 'documents_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Check if cache is valid
  const getCachedDocuments = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp, source } = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid and source matches
      const currentSource = useGoogleDriveFiles ? 'gdrive' : 'airweave';
      if (now - timestamp < CACHE_DURATION && source === currentSource) {
        return data;
      }
      
      // Cache expired or source changed
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  // Save documents to cache
  const setCachedDocuments = (docs: any[]) => {
    try {
      const source = useGoogleDriveFiles ? 'gdrive' : 'airweave';
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: docs,
        timestamp: Date.now(),
        source
      }));
    } catch (error) {
      console.error("Error saving cache:", error);
    }
  };

  // Fetch documents once at parent level
  const fetchDocuments = async (forceRefresh = false) => {
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = getCachedDocuments();
      if (cached) {
        console.log("Using cached documents");
        setDocuments(cached);
        setIsLoadingDocs(false);
        return;
      }
    }

    setIsLoadingDocs(true);
    try {
      let docs: any[] = [];
      
      if (useGoogleDriveFiles && isConnected) {
        docs = await listFiles();
      } else {
        const { data, error } = await supabase.functions.invoke("list-documents");
        if (error) throw error;
        docs = data?.documents || [];
      }
      
      setDocuments(docs);
      setCachedDocuments(docs);
      console.log("Fetched and cached documents");
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshDocuments, useGoogleDriveFiles, isConnected]);

  const handleGoogleDriveConnect = async () => {
    try {
      await connect();
      toast.success("Đã kết nối Google Drive");
      setUseGoogleDriveFiles(true);
      localStorage.removeItem(CACHE_KEY); // Clear cache when switching source
    } catch (err) {
      toast.error("Không thể kết nối Google Drive");
    }
  };

  const handleGoogleDriveDisconnect = () => {
    disconnect();
    setUseGoogleDriveFiles(false);
    localStorage.removeItem(CACHE_KEY); // Clear cache when switching source
    toast.success("Đã ngắt kết nối Google Drive");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Đã đăng xuất thành công");
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Lỗi khi đăng xuất");
    }
  };

  const handleFiltersChange = (newFilters: Record<string, boolean>) => {
    setFilters(newFilters);
  };

  const handleUploadSuccess = () => {
    // Clear cache and trigger refresh to fetch new document
    localStorage.removeItem(CACHE_KEY);
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
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          query: content.trim(),
          filters: filters,
        },
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

  const activeFiltersCount = Object.keys(filters).filter((key) => filters[key]).length;

  return (
    <div className="flex h-full">
      {/* Document filters sidebar - Desktop (Left side) */}
      <div className="w-80 border-r border-border/50 hidden lg:block bg-card/30 backdrop-blur flex flex-col">
        <div className="flex-1 overflow-hidden">
          <DocumentFilters 
            onFiltersChange={handleFiltersChange} 
            documents={documents}
            isLoading={isLoadingDocs}
            onRefresh={() => fetchDocuments(true)} // Force refresh
            isConnected={isConnected}
            onConnect={handleGoogleDriveConnect}
            onDisconnect={handleGoogleDriveDisconnect}
          />
        </div>
        <div className="p-4 border-t border-border/50">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Main chat area */}
      {/* Mobile filter button */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="lg:hidden border-b border-border/50 p-3 flex justify-between items-center gap-2 bg-card/30 backdrop-blur">
          <h2 className="text-lg font-semibold">Chat</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-card/50 backdrop-blur border-border/50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative bg-card/50 backdrop-blur border-border/50">
                  <Filter className="h-4 w-4 mr-2" />
                  Bộ lọc
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-card/95 backdrop-blur flex flex-col">
                <SheetHeader className="p-4 border-b border-border/50">
                  <SheetTitle>Bộ Lọc Tài Liệu</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <DocumentFilters 
                    onFiltersChange={handleFiltersChange} 
                    hideHeader
                    documents={documents}
                    isLoading={isLoadingDocs}
                    onRefresh={() => fetchDocuments(true)} // Force refresh
                    isConnected={isConnected}
                    onConnect={handleGoogleDriveConnect}
                    onDisconnect={handleGoogleDriveDisconnect}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} isLoading={isLoading} />
        </div>
        <div className="border-t border-border/50 bg-card/30 backdrop-blur">
          <MessageInput onSend={handleSendMessage} onUploadSuccess={handleUploadSuccess} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};
