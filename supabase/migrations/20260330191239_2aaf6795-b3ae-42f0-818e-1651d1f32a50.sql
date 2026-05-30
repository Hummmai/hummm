
-- Enable PostGIS extension for geographic calculations
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- Create agents table
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo text DEFAULT '🏠',
  rating numeric(3,1) DEFAULT 0,
  stars integer DEFAULT 0,
  avg_days integer DEFAULT 0,
  price_achieved text DEFAULT '0%',
  properties_sold integer DEFAULT 0,
  review_score numeric(2,1) DEFAULT 0,
  strengths text,
  reviews text[] DEFAULT '{}',
  phone text,
  email text,
  website text,
  postcode text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  geo_point extensions.geometry(Point, 4326),
  listing_type text NOT NULL DEFAULT 'sale',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create spatial index
CREATE INDEX idx_agents_geo ON public.agents USING gist(geo_point);
CREATE INDEX idx_agents_listing_type ON public.agents(listing_type);

-- Auto-populate geo_point from lat/lng
CREATE OR REPLACE FUNCTION public.agents_geo_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.geo_point := extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$;

CREATE TRIGGER agents_set_geo
  BEFORE INSERT OR UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.agents_geo_trigger();

-- RPC: find agents within radius (miles) of a lat/lng
CREATE OR REPLACE FUNCTION public.get_agents_by_radius(
  p_lat double precision,
  p_lng double precision,
  p_radius_miles double precision DEFAULT 10,
  p_listing_type text DEFAULT 'sale'
)
RETURNS TABLE(
  id uuid,
  name text,
  logo text,
  rating numeric,
  stars integer,
  avg_days integer,
  price_achieved text,
  properties_sold integer,
  review_score numeric,
  strengths text,
  reviews text[],
  phone text,
  email text,
  website text,
  postcode text,
  distance_miles double precision
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id, a.name, a.logo, a.rating, a.stars, a.avg_days,
    a.price_achieved, a.properties_sold, a.review_score,
    a.strengths, a.reviews, a.phone, a.email, a.website, a.postcode,
    (extensions.ST_DistanceSphere(
      a.geo_point,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)
    ) / 1609.344) AS distance_miles
  FROM public.agents a
  WHERE a.listing_type = p_listing_type
    AND extensions.ST_DWithin(
      a.geo_point::extensions.geography,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography,
      p_radius_miles * 1609.344
    )
  ORDER BY distance_miles ASC;
END;
$$;

-- RLS: public read, service_role full access
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read agents"
  ON public.agents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages agents"
  ON public.agents FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
