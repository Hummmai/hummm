
-- Create storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true);

-- Create property listings table
CREATE TABLE public.property_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Step 1: Property details
  address TEXT NOT NULL,
  postcode TEXT,
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  sqft TEXT,
  
  -- Step 2: Description
  description TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  
  -- Step 3: Pricing & marketing
  ai_suggested_price INTEGER,
  ai_confidence INTEGER,
  asking_price TEXT,
  market_rightmove BOOLEAN DEFAULT true,
  market_zoopla BOOLEAN DEFAULT true,
  market_social BOOLEAN DEFAULT false,
  market_virtual_tour BOOLEAN DEFAULT false,
  
  -- Contact & status
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Valuation reference
  valuation_ref TEXT
);

-- Enable RLS
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Anyone can submit a listing" ON public.property_listings
  FOR INSERT TO anon WITH CHECK (true);

-- Allow reading own listing by id
CREATE POLICY "Anyone can read listings" ON public.property_listings
  FOR SELECT TO anon USING (true);

-- Service role full access
CREATE POLICY "Service role manages listings" ON public.property_listings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Storage policies for listing photos
CREATE POLICY "Anyone can upload listing photos" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'listing-photos');

CREATE POLICY "Anyone can view listing photos" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'listing-photos');
