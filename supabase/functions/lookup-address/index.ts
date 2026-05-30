const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { postcode } = await req.json()
    if (!postcode || typeof postcode !== 'string') {
      return jsonResponse({ error: 'postcode is required' }, 400)
    }

    const stripped = postcode.trim().toUpperCase().replace(/\s+/g, '')
    const formatted = stripped.length >= 5
      ? stripped.slice(0, -3) + ' ' + stripped.slice(-3)
      : stripped

    // ── 1. Ideal Postcodes — full premise-level addresses ──
    const idealKey = Deno.env.get('IDEAL_POSTCODES_API_KEY')
    let idealDepleted = false
    if (idealKey) {
      try {
        // Use the /postcodes endpoint which returns all delivery points (premises) for a postcode
        const res = await fetch(
          `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(formatted)}?api_key=${idealKey}&limit=100`
        )
        if (res.ok) {
          const data = await res.json()
          if (data.result?.length > 0) {
            const addresses = data.result.map((r: any) => {
              // Build a complete formatted address with premise details
              const parts: string[] = []
              // Sub-building (e.g. "Flat 3")
              if (r.sub_building_name) parts.push(r.sub_building_name)
              // Building name (e.g. "Acacia House")
              if (r.building_name) parts.push(r.building_name)
              // Building number + street
              if (r.building_number && r.thoroughfare) {
                parts.push(`${r.building_number} ${r.thoroughfare}`)
              } else if (r.thoroughfare) {
                parts.push(r.thoroughfare)
              } else if (r.building_number) {
                parts.push(r.building_number)
              }
              // Dependent locality
              if (r.dependent_locality) parts.push(r.dependent_locality)
              // Post town
              if (r.post_town) parts.push(r.post_town)
              // Postcode
              if (r.postcode) parts.push(r.postcode)

              // Fallback: use line_1, line_2, line_3 if parts came out empty
              if (parts.length <= 2) {
                return [r.line_1, r.line_2, r.line_3, r.post_town, r.postcode]
                  .filter(Boolean)
                  .join(', ')
              }

              return parts.join(', ')
            })

            // Deduplicate
            const unique = [...new Set(addresses)]

            return jsonResponse({ addresses: unique, source: 'ideal_postcodes', count: unique.length })
          }
        } else {
          const errText = await res.text()
          console.error('Ideal Postcodes HTTP error:', res.status, errText)
          if (errText.includes('4020') || errText.toLowerCase().includes('balance')) {
            idealDepleted = true
          }
        }
      } catch (e) {
        console.error('Ideal Postcodes error, falling back:', e)
      }
    }

    // ── 2. Postcodes.io fallback — validates postcode + returns town/region ──
    // Frontend uses this to render an inline "house number/name" prompt so the
    // flow continues smoothly without dumping the user into full manual entry.
    const pcRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(formatted)}`)
    if (pcRes.ok) {
      const d = await pcRes.json()
      if (d.result) {
        const town = d.result.admin_ward || d.result.admin_district || d.result.region || ''
        return jsonResponse({
          addresses: [],
          source: 'postcode_validated',
          postcode: d.result.postcode,
          town,
          needs_premise: true,
          depleted: idealDepleted,
        })
      }
    } else {
      await pcRes.text()
    }

    return jsonResponse({ addresses: [], source: 'not_found', error: 'No addresses found for this postcode. Please check and try again, or enter your full address manually.' })
  } catch {
    return jsonResponse({ error: 'Invalid request' }, 400)
  }
})
