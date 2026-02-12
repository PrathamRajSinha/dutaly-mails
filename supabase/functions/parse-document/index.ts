import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

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

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    md: "text/markdown",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeMap[ext] || "application/octet-stream";
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

function isTextFile(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return ["txt", "md", "csv", "json", "xml", "html"].includes(ext);
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
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
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

    const arrayBuffer = await fileData.arrayBuffer();
    let extractedText = "";

    // For plain text files, just decode directly
    if (isTextFile(requestData.file_name)) {
      extractedText = new TextDecoder("utf-8").decode(arrayBuffer);
    } else if (lovableApiKey) {
      // Use Gemini to extract text from binary documents (PDF, DOCX, images, etc.)
      console.log("Using AI to extract text from:", requestData.file_name);
      
      const base64Data = base64Encode(new Uint8Array(arrayBuffer));
      const mimeType = getMimeType(requestData.file_name);

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a document text extractor. Extract ALL text content from the provided document. Preserve the structure, headings, lists, and formatting as plain text. Include every detail — names, dates, skills, education, experience, contact info, etc. Do NOT summarize. Do NOT add commentary. Just output the complete extracted text."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract all text content from this ${requestData.file_type} file named "${requestData.file_name}". Return the complete text with structure preserved.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`
                  }
                }
              ]
            }
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("AI extraction failed:", aiResponse.status, errText);
        extractedText = `[File: ${requestData.file_name}] - AI extraction failed. Use the title and content fields for context.`;
      } else {
        const aiResult = await aiResponse.json();
        extractedText = aiResult.choices?.[0]?.message?.content || "";
        console.log(`AI extracted ${extractedText.length} characters`);
      }
    } else {
      console.warn("No LOVABLE_API_KEY available for AI extraction");
      extractedText = `[File: ${requestData.file_name}] - No AI key available for extraction.`;
    }

    // Trim to reasonable size
    extractedText = extractedText.slice(0, 100000);

    console.log(`Final extracted text: ${extractedText.length} characters from ${requestData.file_name}`);

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
