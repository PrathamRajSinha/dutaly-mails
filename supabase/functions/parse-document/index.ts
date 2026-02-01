import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ParseDocumentRequest {
  storage_path: string;
  file_name: string;
  file_type: string;
  entry_id: string;
}

// Simple text extraction based on file type
async function extractTextFromFile(fileData: ArrayBuffer, fileType: string, fileName: string): Promise<string> {
  const decoder = new TextDecoder("utf-8");
  
  // For text files, decode directly
  if (fileType === "txt" || fileName.endsWith(".txt") || fileName.endsWith(".md")) {
    return decoder.decode(fileData);
  }
  
  // For other file types, we'll store a placeholder and the AI will use the content field
  // In a production environment, you'd integrate with a document parsing service
  
  // Try to extract any readable text from the binary
  try {
    const text = decoder.decode(fileData);
    // Remove non-printable characters but keep basic text
    const cleanedText = text.replace(/[^\\x20-\\x7E\\n\\r\\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 50000); // Limit to 50k characters
    
    if (cleanedText.length > 100) {
      return cleanedText;
    }
  } catch (_e) {
    // Decoding failed, use placeholder
  }
  
  // Return a placeholder for binary files
  return `[File: ${fileName}] - This file has been uploaded. Use the title and content fields for context about this document.`;
}

function getFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  
  const typeMap: Record<string, string> = {
    pdf: "pdf",
    doc: "docx",
    docx: "docx",
    ppt: "pptx",
    pptx: "pptx",
    txt: "txt",
    md: "txt",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    webp: "image",
  };
  
  return typeMap[ext] || "text";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: ParseDocumentRequest = await req.json();
    console.log("Parsing document:", requestData.file_name, "Type:", requestData.file_type);

    // Verify the entry belongs to the user
    const { data: entry, error: entryError } = await supabase
      .from("knowledge_base_entries")
      .select("id")
      .eq("id", requestData.entry_id)
      .eq("user_id", user.id)
      .single();

    if (entryError || !entry) {
      return new Response(
        JSON.stringify({ error: "Entry not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("kb-documents")
      .download(requestData.storage_path);

    if (downloadError || !fileData) {
      console.error("Failed to download file:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Extract text from the file
    const extractedText = await extractTextFromFile(
      arrayBuffer,
      requestData.file_type,
      requestData.file_name
    );

    console.log(`Extracted ${extractedText.length} characters from ${requestData.file_name}`);

    // Update the entry with extracted text
    const { error: updateError } = await supabase
      .from("knowledge_base_entries")
      .update({
        extracted_text: extractedText,
        file_type: getFileType(requestData.file_name),
        file_name: requestData.file_name,
      })
      .eq("id", requestData.entry_id);

    if (updateError) {
      console.error("Failed to update entry:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update entry" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        extracted_length: extractedText.length,
        file_type: getFileType(requestData.file_name),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error parsing document:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

