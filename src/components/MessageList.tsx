import { useEffect, useRef } from "react";
import { Message, Source } from "./ChatInterface";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const SourceList = ({ sources }: { sources: Source[] }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-xs h-auto py-1.5"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              <span>{sources.length} nguồn tài liệu</span>
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {sources.map((source, index) => {
            const sourceUrl = source.url || source.link;
            return (
              <div
                key={index}
                className="text-xs p-2 rounded-md bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex flex-wrap gap-1 mb-1 items-center">
                  {source.filename && (
                    <Badge variant="secondary" className="text-xs">
                      {source.filename}
                    </Badge>
                  )}
                  {source.source && (
                    <Badge variant="outline" className="text-xs">
                      {source.source}
                    </Badge>
                  )}
                  {sourceUrl && (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-primary hover:underline text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Xem tài liệu</span>
                    </a>
                  )}
                </div>
                {source.content && (
                  <p className="text-muted-foreground line-clamp-2 mt-1">
                    {source.content.substring(0, 150)}
                    {source.content.length > 150 ? "..." : ""}
                  </p>
                )}
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">
              Chào mừng đến với RAG Chat
            </h2>
            <p className="text-muted-foreground max-w-md">
              Hỏi câu hỏi và tôi sẽ tìm kiếm trong tài liệu để trả lời dựa trên các bộ lọc bạn chọn.
            </p>
          </div>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] md:max-w-[70%] rounded-xl px-4 py-3 ${
              message.role === "user"
                ? "bg-chat-user text-chat-user-foreground"
                : "bg-chat-assistant text-chat-assistant-foreground border border-border"
            }`}
          >
            <div className="prose prose-sm max-w-none">
              {message.content.split('\n').map((line, i) => {
                // Parse citations like "Google Drive [2]" or "Source [1]"
                // Match pattern: "Source Name [number]" where Source Name can be multiple words
                const citationRegex = /([A-Za-zÀ-ỹ\s]+?)\s*\[(\d+)\]/g;
                const parts: (string | JSX.Element)[] = [];
                let lastIndex = 0;
                let match;
                let citationIndex = 0;

                while ((match = citationRegex.exec(line)) !== null) {
                  // Add text before citation
                  if (match.index > lastIndex) {
                    parts.push(line.substring(lastIndex, match.index));
                  }

                  const sourceName = match[1];
                  const citationNumber = parseInt(match[2], 10);
                  
                  // Find corresponding source
                  const source = message.sources?.[citationNumber - 1];
                  const sourceUrl = source?.url || source?.link;

                  // Create clickable citation
                  if (sourceUrl) {
                    parts.push(
                      <span key={`citation-${i}-${citationIndex++}`} className="inline-flex items-center gap-1">
                        <span>{sourceName}</span>
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                          title={`Xem tài liệu: ${source?.filename || sourceName}`}
                        >
                          [{citationNumber}]
                        </a>
                      </span>
                    );
                  } else {
                    // Non-clickable citation if no URL
                    parts.push(
                      <span key={`citation-${i}-${citationIndex++}`} className="text-primary font-medium">
                        {match[0]}
                      </span>
                    );
                  }

                  lastIndex = match.index + match[0].length;
                }

                // Add remaining text
                if (lastIndex < line.length) {
                  parts.push(line.substring(lastIndex));
                }

                // If no citations found, just render the line as is
                const content = parts.length > 0 ? parts : [line];

                return (
                  <p key={i} className="mb-2 last:mb-0">
                    {content}
                  </p>
                );
              })}
            </div>
            
            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <SourceList sources={message.sources} />
            )}
            
            <div className="text-xs opacity-70 mt-2">
              {message.timestamp.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-chat-assistant text-chat-assistant-foreground border border-border rounded-xl px-4 py-3">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
