import { useEffect, useRef } from "react";
import { Message, Source } from "./ChatInterface";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

// Helper function to validate and normalize URL
const getValidUrl = (url: string | undefined, metadata?: Record<string, any>): string | null => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    // Try to extract from metadata
    if (metadata) {
      const metaUrl =
        metadata.url || metadata.link || metadata.file_url || metadata.document_url || metadata.source_url;
      if (metaUrl && typeof metaUrl === "string" && metaUrl.trim() !== "") {
        url = metaUrl;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  // Normalize URL
  url = url.trim();

  // Transform Google Drive API URLs to sharing links
  // Pattern: googleapis.com/drive/v3/files/{fileId}?alt=media
  const googleDriveApiMatch = url.match(/googleapis\.com\/drive\/v3\/files\/([a-zA-Z0-9_-]+)/);
  if (googleDriveApiMatch) {
    const fileId = googleDriveApiMatch[1];
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  // Also handle drive.google.com/uc?id= format
  const googleDriveUcMatch = url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (googleDriveUcMatch) {
    const fileId = googleDriveUcMatch[1];
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  // Check if URL is valid (starts with http:// or https://)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      // Validate URL format
      new URL(url);
      return url;
    } catch {
      return null;
    }
  }

  // If URL doesn't have protocol, try to add https://
  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  // If it looks like a domain or path, add https://
  if (url.includes(".") && !url.includes(" ")) {
    try {
      const testUrl = url.startsWith("/") ? url : `https://${url}`;
      new URL(testUrl);
      return testUrl;
    } catch {
      return null;
    }
  }

  return null;
};

const SourceList = ({ sources }: { sources: Source[] }) => {
  if (!sources || sources.length === 0) return null;

  // Deduplicate sources based on filename and source
  const uniqueSources = sources.reduce((acc, source) => {
    const key = `${source.filename || 'Unknown'}::${source.source || 'Unknown'}`;
    if (!acc.some(s => `${s.filename || 'Unknown'}::${s.source || 'Unknown'}` === key)) {
      acc.push(source);
    }
    return acc;
  }, [] as Source[]);

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between text-xs h-auto py-1.5">
            <span className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              <span>{uniqueSources.length} nguồn tài liệu</span>
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {uniqueSources.map((source, index) => {
            // Get valid URL with fallback to metadata
            const sourceUrl = getValidUrl(source.url || source.link, source.metadata);

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
                  {sourceUrl ? (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-primary hover:underline text-xs cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Ensure link opens in new tab
                        window.open(sourceUrl, "_blank", "noopener,noreferrer");
                      }}
                      title={`Mở tài liệu: ${source.filename || "Tài liệu"}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Xem tài liệu</span>
                    </a>
                  ) : (
                    <span
                      className="ml-auto flex items-center gap-1 text-muted-foreground text-xs"
                      title="Không có link tài liệu"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Không có link</span>
                    </span>
                  )}
                </div>
                {source.content && (() => {
                  // Don't show content if it's raw JSON metadata
                  const contentStr = String(source.content).trim();
                  if (contentStr.startsWith('{') && contentStr.includes('"id"') && contentStr.includes('"payload"')) {
                    return null;
                  }
                  return (
                    <p className="text-muted-foreground line-clamp-2 mt-1">
                      {source.content.substring(0, 150)}
                      {source.content.length > 150 ? "..." : ""}
                    </p>
                  );
                })()}
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
            <h2 className="text-2xl font-semibold text-foreground">Chào mừng đến với RAG Chat</h2>
            <p className="text-muted-foreground max-w-md">
              Hỏi câu hỏi và tôi sẽ tìm kiếm trong tài liệu để trả lời dựa trên các bộ lọc bạn chọn.
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[95%] md:max-w-[90%] rounded-xl px-4 py-3 ${
              message.role === "user"
                ? "bg-chat-user text-chat-user-foreground"
                : "bg-chat-assistant text-chat-assistant-foreground border border-border"
            }`}
          >
            <div className="prose prose-sm max-w-none">
              {message.content.split("\n").map((line, i) => {
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
                  const sourceUrl = getValidUrl(source?.url || source?.link, source?.metadata);

                  // Create clickable citation
                  if (sourceUrl) {
                    parts.push(
                      <span key={`citation-${i}-${citationIndex++}`} className="inline-flex items-center gap-1">
                        <span>{sourceName}</span>
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium cursor-pointer"
                          title={`Xem tài liệu: ${source?.filename || sourceName}`}
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(sourceUrl, "_blank", "noopener,noreferrer");
                          }}
                        >
                          [{citationNumber}]
                        </a>
                      </span>,
                    );
                  } else {
                    // Non-clickable citation if no URL
                    parts.push(
                      <span key={`citation-${i}-${citationIndex++}`} className="text-primary font-medium">
                        {match[0]}
                      </span>,
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
            {message.sources && message.sources.length > 0 && <SourceList sources={message.sources} />}

            <div className="text-xs opacity-70 mt-2">
              {message.timestamp.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
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
