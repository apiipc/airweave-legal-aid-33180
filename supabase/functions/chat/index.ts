import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIRWEAVE_CONFIG, getSearchUrl, getAirweaveHeaders } from "../_shared/airweave-config.ts";
import { SYSTEM_PROMPT } from "../_shared/system-prompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AirweaveResult {
  content?: string;
  text?: string;
  payload?: {
    content?: string;
    text?: string;
    filename?: string;
    source?: string;
    [key: string]: any;
  };
  metadata?: {
    filename?: string;
    source?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface AirweaveContext {
  context: string;
  sources: Array<{
    filename?: string;
    source?: string;
    content?: string;
    url?: string;
    link?: string;
    metadata?: Record<string, any>;
  }>;
  airweaveAnswer?: string;
  airweaveCitations?: any[];
}

async function getAirweaveContext(userQuery: string, filters?: Record<string, boolean>): Promise<AirweaveContext> {
  const url = getSearchUrl();

  console.log("Calling Airweave with query:", userQuery);
  console.log("Collection ID:", AIRWEAVE_CONFIG.collectionId);
  console.log("Filters:", filters);

  // Build filter object for Airweave API
  const airweaveFilters: Record<string, any> = {};
  if (filters) {
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        // Parse filter key (e.g., "filename:doc.pdf" or "source:Google Drive")
        const [filterType, filterValue] = key.split(":");
        if (filterType && filterValue) {
          if (!airweaveFilters[filterType]) {
            airweaveFilters[filterType] = [];
          }
          airweaveFilters[filterType].push(filterValue);
        }
      }
    });
  }

  const payload: any = {
    query: userQuery,
    ...AIRWEAVE_CONFIG.searchConfig,
  };

  // Add filters to payload if any
  if (Object.keys(airweaveFilters).length > 0) {
    payload.filters = airweaveFilters;
    console.log("Applied filters:", airweaveFilters);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getAirweaveHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airweave API error:", response.status, errorText);

      if (response.status === 404) {
        return {
          context: "❌ Collection không tồn tại. Vui lòng kiểm tra Collection ID.",
          sources: [],
          airweaveAnswer: undefined,
          airweaveCitations: [],
        };
      }

      return {
        context: "Không thể truy xuất ngữ cảnh từ tài liệu.",
        sources: [],
        airweaveAnswer: undefined,
        airweaveCitations: [],
      };
    }

    const body = await response.json();
    console.log("Airweave results:", body.results?.length || 0, "documents found");
    console.log("Airweave answer:", body.answer ? "Yes" : "No");
    console.log("Full response structure:", JSON.stringify(body, null, 2).substring(0, 2000));

    // Check if Airweave generated an answer with citations
    const airweaveAnswer = body.answer;
    const airweaveCitations = body.citations || body.references || [];

    // Parse content và sources từ Airweave response
    if (body.results && body.results.length > 0) {
      const sources: Array<{
        filename?: string;
        source?: string;
        content?: string;
        url?: string;
        link?: string;
        metadata?: Record<string, any>;
      }> = [];

      const contextParts = body.results.map((r: AirweaveResult) => {
        // Extract content
        const content = r.content || r.text || r.payload?.content || r.payload?.text || JSON.stringify(r);

        // Extract metadata for sources
        const filename =
          r.metadata?.filename ||
          r.payload?.filename ||
          r.metadata?.name ||
          r.payload?.name ||
          r.metadata?.title ||
          r.payload?.title ||
          r.metadata?.file_name ||
          r.payload?.file_name;

        const source = r.metadata?.source || r.payload?.source || r.metadata?.origin || r.payload?.origin;

        // Extract URL/link from various possible fields
        const url =
          r.metadata?.url ||
          r.payload?.url ||
          r.metadata?.link ||
          r.payload?.link ||
          r.metadata?.file_url ||
          r.payload?.file_url ||
          r.metadata?.document_url ||
          r.payload?.document_url ||
          r.metadata?.source_url ||
          r.payload?.source_url ||
          r.metadata?.web_url ||
          r.payload?.web_url ||
          r.metadata?.download_url ||
          r.payload?.download_url ||
          r.metadata?.view_url ||
          r.payload?.view_url;

        // Log for debugging if no URL found
        if (!url) {
          console.log("No URL found for document:", {
            id: r.id,
            filename,
            metadataKeys: r.metadata ? Object.keys(r.metadata) : [],
            payloadKeys: r.payload ? Object.keys(r.payload) : [],
          });
        }

        // Store source information with full metadata for URL extraction fallback
        sources.push({
          filename,
          source,
          url: url || undefined, // Only set if URL exists
          link: url || undefined, // Alias for compatibility
          content: content.substring(0, 500), // Store preview
          metadata: {
            ...r.metadata,
            ...r.payload,
            // Include raw data for URL extraction fallback
            _raw: r,
          },
        });

        return content;
      });

      const context = contextParts.join("\n---\n");

      console.log("Final context length:", context.length);
      console.log("Extracted sources:", sources.length);

      return {
        context,
        sources,
        airweaveAnswer, // Return Airweave's generated answer if available
        airweaveCitations, // Return citations if available
      };
    }

    return {
      context: "Không tìm thấy ngữ cảnh phù hợp trong các tài liệu.",
      sources: [],
      airweaveAnswer: undefined,
      airweaveCitations: [],
    };
  } catch (error) {
    console.error("Airweave error:", error);
    return {
      context: "Lỗi khi truy xuất nội bộ.",
      sources: [],
      airweaveAnswer: undefined,
      airweaveCitations: [],
    };
  }
}

async function generateAnswer(context: string, userQuery: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Ngữ cảnh từ tài liệu:\n${context}\n\nCâu hỏi: ${userQuery}` },
  ];

  console.log("Calling Lovable AI with model: google/gemini-2.5-flash");

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);

      if (response.status === 429) {
        return "Vượt quá giới hạn yêu cầu, vui lòng thử lại sau.";
      }
      if (response.status === 402) {
        return "Cần thanh toán để tiếp tục sử dụng AI. Vui lòng thêm credits vào workspace.";
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "Không thể tạo câu trả lời.";

    console.log("Generated answer successfully");
    return answer;
  } catch (error) {
    console.error("AI generation error:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, filters } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("=== RAG Request ===");
    console.log("Query:", query);
    console.log("Filters:", filters);

    // Step 1: Retrieve context and sources from Airweave
    const { context, sources, airweaveAnswer, airweaveCitations } = await getAirweaveContext(query, filters);

    // Step 2: Use Airweave's answer if available, otherwise generate with LLM
    let answer: string;
    if (airweaveAnswer) {
      console.log("Using Airweave's generated answer");
      answer = airweaveAnswer;
    } else {
      console.log("Generating answer with LLM");
      answer = await generateAnswer(context, query);
    }

    return new Response(
      JSON.stringify({
        answer,
        sources, // Return sources for display
        citations: airweaveCitations, // Return citations if available
        context: context.substring(0, 500) + "...", // Return snippet of context for debugging
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Chat endpoint error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
