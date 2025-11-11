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

    const authHeader = req.headers.get("authorization");
    
    // Get documents from Airweave (external source)
    const airweaveDocuments = await getDocumentsFromAirweave();

    // Get uploaded documents from Supabase Storage if authenticated
    let uploadedDocuments: Document[] = [];
    if (authHeader) {
      try {
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          {
            global: {
              headers: { Authorization: authHeader },
            },
          }
        );

        const { data: docs, error } = await supabase
          .from("uploaded_documents")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && docs) {
          uploadedDocuments = docs.map((doc: any) => {
            const { data: publicUrl } = supabase.storage
              .from("documents")
              .getPublicUrl(doc.file_path);

            return {
              filename: doc.filename,
              source: "User Upload",
              id: doc.id,
              url: publicUrl.publicUrl,
              link: publicUrl.publicUrl,
              metadata: {
                file_type: doc.file_type,
                file_size: doc.file_size,
                created_at: doc.created_at,
                user_id: doc.user_id,
              },
            };
          });
          console.log("Found uploaded documents:", uploadedDocuments.length);
        }
      } catch (error) {
        console.error("Error fetching uploaded documents:", error);
      }
    }

    // Combine documents from both sources
    const allDocuments = [...uploadedDocuments, ...airweaveDocuments];

    return new Response(
      JSON.stringify({
        documents: allDocuments,
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

