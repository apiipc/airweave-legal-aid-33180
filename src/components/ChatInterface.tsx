import { useState } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const handleUploadSuccess = () => {
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
      // Call edge function with query
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          query: content.trim(),
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

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="border-b border-border/50 p-3 flex justify-between items-center gap-2 bg-card/30 backdrop-blur">
          <h2 className="text-lg font-semibold">Chat</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="bg-card/50 backdrop-blur border-border/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
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
