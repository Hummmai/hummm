
-- Create the knowledge chunks table for RAG
CREATE TABLE public.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_document text NOT NULL,
  section_title text,
  content text NOT NULL,
  chunk_index integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  search_vector tsvector,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create GIN index for fast full-text search
CREATE INDEX idx_knowledge_chunks_search ON public.knowledge_chunks USING gin(search_vector);

-- Create index on source_document for filtering
CREATE INDEX idx_knowledge_chunks_source ON public.knowledge_chunks (source_document);

-- Auto-generate search_vector on insert/update
CREATE OR REPLACE FUNCTION public.knowledge_chunks_search_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.section_title, '') || ' ' || NEW.content
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_knowledge_chunks_search
  BEFORE INSERT OR UPDATE ON public.knowledge_chunks
  FOR EACH ROW
  EXECUTE FUNCTION public.knowledge_chunks_search_trigger();

-- Search function: ranked full-text search returning top N chunks
CREATE OR REPLACE FUNCTION public.search_knowledge(
  query_text text,
  match_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  source_document text,
  section_title text,
  content text,
  rank real
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.source_document,
    kc.section_title,
    kc.content,
    ts_rank_cd(kc.search_vector, websearch_to_tsquery('english', query_text)) AS rank
  FROM public.knowledge_chunks kc
  WHERE kc.search_vector @@ websearch_to_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- RLS: service role only (knowledge base is managed internally)
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages knowledge"
  ON public.knowledge_chunks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
