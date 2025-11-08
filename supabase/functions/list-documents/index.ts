import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIRWEAVE_CONFIG, getAirweaveHeaders } from "../_shared/airweave-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Document {
  filename?: string;
  source?: string;
  id?: string;
  url?: string;
  link?: string;
  metadata?: Record<string, any>;
}

async function getDocumentsFromAirweave(): Promise<Document[]> {
  // Try to get documents by making a broad search query
  // This will return documents with their metadata
  const url = `${AIRWEAVE_CONFIG.baseUrl}/collections/${AIRWEAVE_CONFIG.collectionId}/search`;

  try {
    // Use a very broad query to get all documents
    const payload = {
      query: "*", // Broad query to get all documents
      limit: 100, // Get more documents to extract unique list
      retrieval_strategy: "hybrid" as const,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: getAirweaveHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airweave API error:", response.status, errorText);
      return [];
    }

    const body = await response.json();
    console.log("Airweave search results:", body.results?.length || 0, "documents found");

    if (!body.results || body.results.length === 0) {
      return [];
    }

    // Extract unique documents based on filename and source
    const documentsMap = new Map<string, Document>();

    body.results.forEach((r: any) => {
      const filename =
        r.metadata?.filename ||
        r.payload?.filename ||
        r.metadata?.name ||
        r.payload?.name ||
        r.metadata?.title ||
        r.payload?.title ||
        r.metadata?.file_name ||
        r.payload?.file_name;

      const source =
        r.metadata?.source ||
        r.payload?.source ||
        r.metadata?.origin ||
        r.payload?.origin ||
        r.metadata?.source_type ||
        r.payload?.source_type ||
        "Unknown";

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
        r.payload?.source_url;

      // If no filename but has content, try to extract from content or use a default
      const displayName = filename || `Document ${r.id?.substring(0, 8) || 'Unknown'}`;

      const key = `${displayName}::${source}`;
      if (!documentsMap.has(key)) {
        documentsMap.set(key, {
          filename: displayName,
          source,
          id: r.id || r.metadata?.id || r.payload?.id,
          url: url,
          link: url, // Alias for compatibility
          metadata: { ...r.metadata, ...r.payload },
        });
      }
    });

    const documents = Array.from(documentsMap.values());
    console.log("Extracted unique documents:", documents.length);

    return documents;
  } catch (error) {
    console.error("Error fetching documents from Airweave:", error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== List Documents Request ===");

    const documents = await getDocumentsFromAirweave();

    return new Response(
      JSON.stringify({
        documents,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("List documents endpoint error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
        documents: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

