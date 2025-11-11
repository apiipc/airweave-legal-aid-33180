import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UploadRequest {
  filename: string;
  fileType: string;
  content: string; // Base64 encoded content
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication required",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid authentication",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
    console.log("User ID:", user.id);

    // Decode base64 content
    const binaryContent = Uint8Array.from(atob(content), (c) => c.charCodeAt(0));

    // Create file path with user ID folder
    const filePath = `${user.id}/${Date.now()}-${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, binaryContent, {
        contentType: fileType || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Upload failed: ${uploadError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("File uploaded to storage:", uploadData.path);

    // Save metadata to database
    const { data: docData, error: dbError } = await supabase
      .from("uploaded_documents")
      .insert({
        user_id: user.id,
        filename: filename,
        file_path: uploadData.path,
        file_type: fileType,
        file_size: binaryContent.length,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Try to cleanup the uploaded file
      await supabase.storage.from("documents").remove([uploadData.path]);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to save document metadata: ${dbError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Document metadata saved:", docData.id);

    return new Response(
      JSON.stringify({
        success: true,
        documentId: docData.id,
        message: "Document uploaded successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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
