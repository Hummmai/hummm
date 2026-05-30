import { z } from "npm:zod@3.25.76"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
}

const BodySchema = z.object({
  input: z.string().trim().min(2).max(255),
  sessionToken: z.string().trim().min(1).max(255).optional(),
  regionCodes: z.array(z.string().trim().min(2).max(3)).max(15).optional(),
  languageCode: z.string().trim().min(2).max(10).optional(),
})

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string
      text?: { text?: string }
      structuredFormat?: {
        mainText?: { text?: string }
        secondaryText?: { text?: string }
      }
    }
  }>
  error?: {
    message?: string
    status?: string
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY")
    if (!apiKey) {
      return new Response(JSON.stringify({ predictions: [], error: "Google Maps API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return new Response(JSON.stringify({ predictions: [], error: "Please enter at least 2 characters to search." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { input, sessionToken, regionCodes, languageCode } = parsed.data
    const includedRegionCodes = (regionCodes && regionCodes.length > 0)
      ? regionCodes.map((c) => c.toLowerCase())
      : ["gb"]

    const googleResponse = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "suggestions.placePrediction.placeId",
          "suggestions.placePrediction.text.text",
          "suggestions.placePrediction.structuredFormat.mainText.text",
          "suggestions.placePrediction.structuredFormat.secondaryText.text",
        ].join(","),
      },
      body: JSON.stringify({
        input,
        includedRegionCodes,
        languageCode: languageCode || "en",
        sessionToken,
      }),
    })

    const data = (await googleResponse.json()) as GoogleAutocompleteResponse

    if (!googleResponse.ok) {
      const errorMessage = data.error?.message || data.error?.status || "Google Places request failed"
      console.error("Google Places API error:", errorMessage)
      return new Response(JSON.stringify({ predictions: [], error: errorMessage }), {
        status: googleResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const predictions = (data.suggestions || [])
      .map((suggestion) => suggestion.placePrediction)
      .filter((prediction): prediction is NonNullable<typeof prediction> => Boolean(prediction?.placeId && prediction?.text?.text))
      .slice(0, 8)
      .map((prediction) => ({
        description: prediction.text?.text || "",
        placeId: prediction.placeId || "",
        mainText: prediction.structuredFormat?.mainText?.text || prediction.text?.text || "",
        secondaryText: prediction.structuredFormat?.secondaryText?.text || "",
      }))

    return new Response(JSON.stringify({ predictions, error: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch address suggestions"
    console.error("Google Places autocomplete error:", message)
    return new Response(JSON.stringify({ predictions: [], error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
