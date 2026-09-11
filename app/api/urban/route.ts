import { type NextRequest, NextResponse } from "next/server"
import type { GeoLocation, UrbanPayload } from "@/lib/weather-types"

// Known urban drainage hotspots in major Indian metropolitan centers
const URBAN_HOTSPOTS: Record<string, string[]> = {
  "delhi": ["Minto Bridge Underpass", "ITO Junction", "Pul Prahladpur", "Zakhira Underpass", "Dhaula Kuan Loop"],
  "mumbai": ["Hindmata (Dadar)", "Gandhi Market (King Circle)", "Milan Subway (Santacruz)", "Andheri Subway", "Sion Circle"],
  "bengaluru": ["Silk Board Junction", "Bellandur Underpass", "Outer Ring Road (Ecospace)", "Hebbal Flyover Loop", "Shivajinagar Bus Stand"],
  "chennai": ["Velachery Main Road", "T. Nagar G.N. Chetty Road", "Perambur Subway", "Madipakkam Lake Basin", "Vyasarapadi Jeeva"],
  "kolkata": ["Thanthania Kalibari", "Park Circus 7-Point", "Central Avenue", "Behala Chowrasta", "Ultadanga Underpass"],
  "hyderabad": ["Tolichowki", "Alwal Railway Underbridge", "Nizampet Lake Basin", "Malakpet Rail Underpass", "Gachibowli Bio-Diversity Junction"],
  "patna": ["Rajendra Nagar", "Kankarbagh Colony", "Dak Bungalow Crossing", "Boring Road Canal Road", "Saidpur Nala Belt"],
  "lucknow": ["Hazratganj GPO Crossing", "Gomti Nagar Marine Drive low-lying", "Charbagh Underpass", "Alambagh Bus Stand", "Polytechnic Chauraha"],
}

async function geocode(city: string): Promise<GeoLocation | null> {
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`
    )
    if (r.ok) {
      const geo = await r.json()
      if (Array.isArray(geo.results) && geo.results.length > 0) {
        const candidates = geo.results.filter((x: { country_code?: string }) => x.country_code === "IN")
        const best = candidates.length > 0 ? candidates[0] : geo.results[0]
        return { name: best.name, state: best.admin1, country: best.country ?? "India", lat: best.latitude, lon: best.longitude }
      }
    }
  } catch {}

  return null
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city")?.trim() || "Delhi"
  const geo = await geocode(city)

  if (!geo) {
    return NextResponse.json({ error: `Could not find location for "${city}"` }, { status: 404 })
  }

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,surface_pressure&hourly=precipitation&timezone=auto`
    const res = await fetch(weatherUrl, { next: { revalidate: 1800 } })

    if (res.ok) {
      const data = await res.json()
      const c = data.current || {}
      const h = data.hourly || {}

      const temp = c.temperature_2m ?? 32
      const rh = c.relative_humidity_2m ?? 60
      const rain = c.precipitation ?? 0
      const wind = c.wind_speed_10m ?? 8

      // 1. Urban Heat Island (UHI) Delta calculation
      // Dense concrete and asphalt absorption creates +1.8°C to +4.2°C excess heat
      const isNight = new Date().getUTCHours() > 14 || new Date().getUTCHours() < 1
      const uhiDelta = Math.round((isNight ? 2.8 + (temp > 30 ? 1.0 : 0) : 1.9 + (temp > 35 ? 0.8 : 0)) * 10) / 10

      // 2. Drainage & Waterlogging Vulnerability
      const rainNext6h = (h.precipitation || []).slice(0, 6).reduce((a: number, b: number) => a + (b ?? 0), 0)
      let drainageVulnerability: UrbanPayload["drainageVulnerability"] = "Low"
      if (rainNext6h > 45 || rain > 20) {
        drainageVulnerability = "Critical Flash Flood Risk"
      } else if (rainNext6h > 20 || rain > 8) {
        drainageVulnerability = "High"
      } else if (rainNext6h > 5 || rain > 1) {
        drainageVulnerability = "Moderate"
      }

      // 3. Waterlogging Hotspots
      const cityKey = geo.name.toLowerCase()
      const matchedKey = Object.keys(URBAN_HOTSPOTS).find(k => cityKey.includes(k))
      const hotspots = matchedKey
        ? URBAN_HOTSPOTS[matchedKey]
        : [`${geo.name} Railway Underpasses`, `${geo.name} Bus Terminal Belt`, "Low-lying Municipal Catchment", "Ring Road Drainage Channels"]

      // 4. UTCI (Universal Thermal Climate Index) Heat Stress
      // UTCI combines 2m temp, radiant load, humidity and wind
      const vaporPressure = (rh / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp))
      const utci = Math.round((temp + 0.33 * vaporPressure - 0.7 * (wind * 0.28) - 4.0) * 10) / 10

      let comfortCategory: UrbanPayload["thermalComfortCategory"] = "Comfortable"
      if (utci > 42) comfortCategory = "Extreme Heat Stress"
      else if (utci > 36) comfortCategory = "Strong Heat Stress"
      else if (utci > 28) comfortCategory = "Moderate Heat Stress"

      // 5. Construction & Heavy Machinery Clearance
      let constructionStatus: UrbanPayload["constructionClearance"]["status"] = "Approved"
      let constructionReason = "Weather conditions suitable for tower cranes, outdoor concrete pouring, and high-rise scaffolding."

      if (wind > 35 || rain > 15) {
        constructionStatus = "Halted (Adverse Weather)"
        constructionReason = "Suspension of tower cranes, deep excavation, and external scaffolding due to high winds and rain accumulation."
      } else if (wind > 20 || rain > 3 || temp > 42) {
        constructionStatus = "Caution (High Winds/Rain)"
        constructionReason = "Restrict overhead crane lifting and provide mandatory hydration pauses for outdoor labor."
      }

      // 6. Atmospheric Ventilation Index (Mixing height ~ 1200m * wind m/s)
      const mixingHeight = temp > 30 ? 1400 : 800
      const ventIndex = Math.round((wind / 3.6) * mixingHeight)
      let dispCat: UrbanPayload["dispersionCategory"] = "Moderate"
      if (ventIndex < 2000) dispCat = "Poor (Smog Accumulation)"
      else if (ventIndex > 6000) dispCat = "Good (Clean Dispersion)"

      const payload: UrbanPayload = {
        location: geo,
        urbanHeatIslandDelta: uhiDelta,
        drainageVulnerability,
        waterloggingHotspots: hotspots,
        thermalComfortUTCI: utci,
        thermalComfortCategory: comfortCategory,
        constructionClearance: {
          status: constructionStatus,
          reason: constructionReason,
        },
        ventilationCoefficient: ventIndex,
        dispersionCategory: dispCat,
        source: "live",
      }

      return NextResponse.json(payload)
    }
  } catch {}

  // Fallback demo
  const demo: UrbanPayload = {
    location: geo,
    urbanHeatIslandDelta: 2.4,
    drainageVulnerability: "Moderate",
    waterloggingHotspots: [`${geo.name} Central Underpass`, "Municipal Ring Road", "Railway Station Low-Lying Zone"],
    thermalComfortUTCI: 34.5,
    thermalComfortCategory: "Moderate Heat Stress",
    constructionClearance: {
      status: "Approved",
      reason: "Permissible wind speeds and negligible rain for outdoor structural engineering.",
    },
    ventilationCoefficient: 4200,
    dispersionCategory: "Moderate",
    source: "demo",
  }

  return NextResponse.json(demo)
}
