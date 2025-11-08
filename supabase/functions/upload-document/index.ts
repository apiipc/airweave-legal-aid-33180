import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIRWEAVE_CONFIG, getAirweaveHeaders } from "../_shared/airweave-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UploadRequest {
  filename: string;
  fileType: string;
  content: string; // Base64 encoded content
}

async function uploadToAirweave(
  filename: string,
  fileType: string,
  content: string
): Promise<{ success: boolean; error?: string; documentId?: string }> {
  try {
    // Airweave upload endpoint
    const uploadUrl = `${AIRWEAVE_CONFIG.baseUrl}/collections/${AIRWEAVE_CONFIG.collectionId}/documents`;

    // Decode base64 content
    const binaryContent = Uint8Array.from(atob(content), (c) => c.charCodeAt(0));

    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Create a Blob from the binary content
    const blob = new Blob([binaryContent], { type: fileType });
    formData.append("file", blob, filename);
    
    // Add metadata
    formData.append("metadata", JSON.stringify({
      filename: filename,
      source: "User Upload",
      uploaded_at: new Date().toISOString(),
    }));

    console.log("Uploading to Airweave:", filename, "Type:", fileType);

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "x-api-key": AIRWEAVE_CONFIG.apiKey,
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airweave upload error:", response.status, errorText);
      
      // Try alternative method: direct JSON upload
      return await uploadToAirweaveJSON(filename, fileType, content);
    }

    const result = await response.json();
    console.log("Upload successful:", result);

    return {
      success: true,
      documentId: result.id || result.document_id,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function uploadToAirweaveJSON(
  filename: string,
  fileType: string,
  content: string
): Promise<{ success: boolean; error?: string; documentId?: string }> {
  try {
    // Alternative: Try JSON API if FormData doesn't work
    const uploadUrl = `${AIRWEAVE_CONFIG.baseUrl}/collections/${AIRWEAVE_CONFIG.collectionId}/documents`;

    const payload = {
      filename: filename,
      content: content, // Base64 content
      content_type: fileType,
      metadata: {
        filename: filename,
        source: "User Upload",
        uploaded_at: new Date().toISOString(),
      },
    };

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        ...getAirweaveHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airweave JSON upload error:", response.status, errorText);
      return {
        success: false,
        error: `Upload failed: ${response.status} - ${errorText}`,
      };
    }

    const result = await response.json();
    console.log("JSON upload successful:", result);

    return {
      success: true,
      documentId: result.id || result.document_id,
    };
  } catch (error) {
    console.error("JSON upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filename, fileType, content }: UploadRequest = await req.json();

    if (!filename || !content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Filename and content are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("=== Upload Document Request ===");
    console.log("Filename:", filename);
    console.log("File type:", fileType);
    console.log("Content length:", content.length);

    const result = await uploadToAirweave(filename, fileType, content);

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          documentId: result.documentId,
          message: "Document uploaded successfully",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || "Upload failed",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Upload endpoint error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

