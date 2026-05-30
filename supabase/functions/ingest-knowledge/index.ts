import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHUNK_SIZE = 1500; // characters per chunk
const CHUNK_OVERLAP = 200; // overlap between chunks

function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  let current = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      // Keep overlap from the end of previous chunk
      const words = current.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      current = overlapWords.join(" ") + "\n\n" + trimmed;
    } else {
      current += (current ? "\n\n" : "") + trimmed;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  // If text had no paragraph breaks, split by sentences
  if (chunks.length === 0 && text.trim().length > 0) {
    let pos = 0;
    while (pos < text.length) {
      const end = Math.min(pos + chunkSize, text.length);
      chunks.push(text.slice(pos, end).trim());
      pos += chunkSize - overlap;
    }
  }

  return chunks.filter(c => c.length > 50); // skip tiny chunks
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { source_document, section_title, content, replace_source } = await req.json();

    if (!source_document || !content) {
      return new Response(
        JSON.stringify({ error: "source_document and content are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optionally remove existing chunks for this source
    if (replace_source) {
      await supabase
        .from("knowledge_chunks")
        .delete()
        .eq("source_document", source_document);
    }

    // Chunk the content
    const chunks = chunkText(content);
    console.log(`Chunking "${source_document}": ${chunks.length} chunks from ${content.length} chars`);

    // Insert all chunks
    const rows = chunks.map((chunk, i) => ({
      source_document,
      section_title: section_title || null,
      content: chunk,
      chunk_index: i,
      metadata: { total_chunks: chunks.length },
    }));

    const { error } = await supabase.from("knowledge_chunks").insert(rows);

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        source_document,
        chunks_created: chunks.length,
        total_characters: content.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ingest error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
