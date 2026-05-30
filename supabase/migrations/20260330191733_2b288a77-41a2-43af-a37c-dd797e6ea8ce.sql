
DROP FUNCTION public.get_agents_by_radius(double precision, double precision, double precision, text);

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
  latitude double precision,
  longitude double precision,
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
    a.latitude, a.longitude,
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
