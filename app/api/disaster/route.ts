/**
 * /api/disaster — Flood & Cyclone Disaster Early Warning Dissemination System
 *
 * Implements IMD (India Meteorological Department) & NDMA (National Disaster Management Authority)
 * official color-coded alert dissemination:
 * - Red: Take Action (Extreme Danger / Evacuate)
 * - Orange: Be Prepared (High Risk / Ready supplies)
 * - Yellow: Be Updated (Moderate Risk / Monitor bulletins)
 * - Green: No Warning (Normalcy)
 */

import { type NextRequest, NextResponse } from "next/server"
import type { DisasterPayload, GeoLocation, IMDAlertColor } from "@/lib/weather-types"

const STATE_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  "uttar pradesh": { lat: 26.8467, lon: 80.9462, name: "Uttar Pradesh" },
  "up": { lat: 26.8467, lon: 80.9462, name: "Uttar Pradesh" },
  "bihar": { lat: 25.0961, lon: 85.3131, name: "Bihar" },
  "madhya pradesh": { lat: 22.9734, lon: 78.6569, name: "Madhya Pradesh" },
  "mp": { lat: 22.9734, lon: 78.6569, name: "Madhya Pradesh" },
  "maharashtra": { lat: 19.7515, lon: 75.7139, name: "Maharashtra" },
  "rajasthan": { lat: 27.0238, lon: 74.2179, name: "Rajasthan" },
  "gujarat": { lat: 22.2587, lon: 71.1924, name: "Gujarat" },
  "karnataka": { lat: 15.3173, lon: 75.7139, name: "Karnataka" },
  "tamil nadu": { lat: 11.1271, lon: 78.6569, name: "Tamil Nadu" },
  "kerala": { lat: 10.8505, lon: 76.2711, name: "Kerala" },
  "punjab": { lat: 31.1471, lon: 75.3412, name: "Punjab" },
  "haryana": { lat: 29.0588, lon: 76.0856, name: "Haryana" },
  "west bengal": { lat: 22.9868, lon: 87.8550, name: "West Bengal" },
  "odisha": { lat: 20.9517, lon: 85.0985, name: "Odisha" },
  "telangana": { lat: 18.1124, lon: 79.0193, name: "Telangana" },
  "andhra pradesh": { lat: 15.9129, lon: 79.7400, name: "Andhra Pradesh" },
  "ap": { lat: 15.9129, lon: 79.7400, name: "Andhra Pradesh" },
  "jharkhand": { lat: 23.6102, lon: 85.2799, name: "Jharkhand" },
  "chhattisgarh": { lat: 21.2787, lon: 81.8661, name: "Chhattisgarh" },
  "uttarakhand": { lat: 30.0668, lon: 79.0193, name: "Uttarakhand" },
  "himachal pradesh": { lat: 31.1048, lon: 77.1734, name: "Himachal Pradesh" },
  "assam": { lat: 26.2006, lon: 92.9376, name: "Assam" },
  "goa": { lat: 15.2993, lon: 74.1240, name: "Goa" },
  "delhi": { lat: 28.6139, lon: 77.2090, name: "Delhi" },
  "jammu and kashmir": { lat: 33.7782, lon: 76.5762, name: "Jammu and Kashmir" },
  "ladakh": { lat: 34.1526, lon: 77.5771, name: "Ladakh" },
}

async function geocodeLocation(query: string): Promise<GeoLocation | null> {
  const cleanQ = query.trim()
  if (!cleanQ) return null
  const lowerQ = cleanQ.toLowerCase()

  if (STATE_COORDS[lowerQ]) {
    const s = STATE_COORDS[lowerQ]
    return { name: s.name, state: s.name, country: "India", lat: s.lat, lon: s.lon }
  }

  for (const [k, v] of Object.entries(STATE_COORDS)) {
    if (lowerQ.includes(k)) {
      return { name: v.name, state: v.name, country: "India", lat: v.lat, lon: v.lon }
    }
  }

  // Open-Meteo Geocoding
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQ)}&count=5&language=en&format=json`
    )
    if (geoRes.ok) {
      const geo = await geoRes.json()
      if (Array.isArray(geo.results) && geo.results.length > 0) {
        const inResults = geo.results.filter((r: any) => r.country_code === "IN" || (r.latitude >= 6.0 && r.latitude <= 37.5))
        const best = inResults[0] || geo.results[0]
        return {
          name: best.name,
          state: best.admin1,
          country: "India",
          lat: best.latitude,
          lon: best.longitude,
        }
      }
    }
  } catch {}

  return null
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city")?.trim() || "Odisha"

  try {
    const geo = await geocodeLocation(city)
    if (!geo) {
      return NextResponse.json(
        { error: `स्थान "${city}" नहीं मिला। कृपया जिले या राज्य का नाम सही से लिखें।` },
        { status: 404 }
      )
    }

    let windKph = 24
    let gustsKph = 35
    let rainSumMm = 0
    let pressureHpa = 1008
    let isLive = false

    try {
      const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=wind_speed_10m,wind_gusts_10m,surface_pressure,precipitation&daily=precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto&forecast_days=3`
      const wxRes = await fetch(wxUrl, { next: { revalidate: 300 } })
      if (wxRes.ok) {
        const wxData = await wxRes.json()
        const cur = wxData.current || {}
        const daily = wxData.daily || {}
        windKph = Math.round((cur.wind_speed_10m ?? 6) * 3.6)
        gustsKph = Math.round((cur.wind_gusts_10m ?? cur.wind_speed_10m ?? 9) * 3.6)
        pressureHpa = Math.round(cur.surface_pressure ?? 1008)
        rainSumMm = Math.round(daily.precipitation_sum?.[0] ?? cur.precipitation ?? 0)
        isLive = true
      }
    } catch {}

    const isCoastal = /odisha|orissa|andhra|tamil nadu|west bengal|bengal|gujarat|maharashtra|kerala|karnataka|goa|mumbai|puri|chennai|kolkata/i.test(
      `${geo.state || ""} ${geo.name}`
    )

    let colorAlert: IMDAlertColor = "Yellow"
    let colorAlertTitle = "Yellow: Be Updated (Active Monitoring)"
    let actionDirective = "Be updated on local bulletins. Check drainage in urban and agricultural lowlands."

    let hasCyclone = false
    let cycloneCategory: DisasterPayload["cycloneStatus"]["category"] = "No Active Cyclone"
    let systemName: string | undefined = undefined
    let estimatedLandfall = "N/A - No approaching severe storm system."
    let stormSurgeMeters = 0

    let floodLevel: DisasterPayload["floodRisk"]["level"] = "Low Basin Flow"
    let waterStatus: DisasterPayload["floodRisk"]["waterLevelStatus"] = "Below Warning Level"
    let inundationPct = 25

    // Realistic assessment logic
    if (windKph >= 65 || gustsKph >= 85 || rainSumMm >= 70 || pressureHpa < 992) {
      colorAlert = "Red"
      colorAlertTitle = "Red Alert: Take Action (Extreme Weather Directive)"
      actionDirective = "TAKE ACTION: Evacuate low-lying river and coastal zones immediately. Move to designated NDMA cyclone/flood shelters."

      if (isCoastal) {
        hasCyclone = true
        cycloneCategory = windKph >= 90 ? "Extremely Severe Cyclonic Storm (ESCS)" : "Very Severe Cyclonic Storm (VSCS)"
        systemName = "Cyclonic System (Bay of Bengal / Arabian Sea)"
        estimatedLandfall = "Expected within 18-24 hours along coastal sector."
        stormSurgeMeters = Math.round((windKph / 30) * 10) / 10
      }

      floodLevel = "High Flash Flood Warning"
      waterStatus = "Above Danger Mark"
      inundationPct = 85
    } else if (windKph >= 40 || gustsKph >= 55 || rainSumMm >= 30 || pressureHpa < 1000) {
      colorAlert = "Orange"
      colorAlertTitle = "Orange Alert: Be Prepared (Heavy Weather Warning)"
      actionDirective = "BE PREPARED: Stock 3 days clean water, non-perishable food, flashlights, and power banks. Secure loose tin sheets and livestock."

      if (isCoastal) {
        hasCyclone = true
        cycloneCategory = "Cyclonic Storm (CS)"
        systemName = "Depression / Deep Depression System"
        estimatedLandfall = "Approaching coast; estimated 36-48 hours out."
        stormSurgeMeters = 1.2
      }

      floodLevel = "Moderate Inundation Watch"
      waterStatus = "Approaching Warning Level"
      inundationPct = 55
    } else if (windKph < 20 && rainSumMm < 5) {
      colorAlert = "Green"
      colorAlertTitle = "Green: Normal (No Warning)"
      actionDirective = "Normal atmospheric conditions. Regular agricultural and maritime activities can proceed safely."
      floodLevel = "Normal Flow"
      waterStatus = "Below Warning Level"
      inundationPct = 5
    }

    const basinMap: Record<string, string> = {
      odisha: "Mahanadi & Brahmani River Basin",
      bihar: "Ganga, Kosi & Gandak River Basin",
      "west bengal": "Ganges & Teesta River Basin",
      assam: "Brahmaputra River Basin",
      gujarat: "Narmada & Tapi River Basin",
      maharashtra: "Godavari & Krishna River Basin",
      "uttar pradesh": "Yamuna & Ghaghara River Basin",
      kerala: "Periyar & Bharathappuzha River Basin",
      "tamil nadu": "Cauvery & Vaigai River Basin",
      delhi: "Yamuna Floodplain Basin",
    }
    const stateKey = (geo.state || geo.name).toLowerCase()
    let basinName = "Regional Watershed & Drainage Basin"
    for (const [k, v] of Object.entries(basinMap)) {
      if (stateKey.includes(k)) {
        basinName = v
        break
      }
    }

    const payload: DisasterPayload = {
      location: geo,
      timestamp: new Date().toISOString(),
      colorAlert,
      colorAlertTitle,
      actionDirective,
      cycloneStatus: {
        hasCyclone,
        category: cycloneCategory,
        systemName,
        centralPressureHpa: pressureHpa,
        maxSustainedWindKmph: windKph,
        gustsKmph: gustsKph,
        estimatedLandfall,
        stormSurgeMeters,
      },
      floodRisk: {
        level: floodLevel,
        basinName,
        waterLevelStatus: waterStatus,
        inundationProbabilityPct: inundationPct,
        criticalBlocks: [
          `${geo.name} Lowland Catchment`,
          "River Tributary Embankment Zone",
          "Low-lying Drainage Underpasses",
        ],
      },
      safetyChecklist: [
        "Keep battery-powered radio, torches, and power banks fully charged.",
        "Store minimum 3 days of clean drinking water and emergency medicines.",
        "Identify nearest NDMA shelter; keep official ID cards in waterproof pouches.",
        "Disconnect electrical power mains if water levels begin to rise.",
        "Never drive or walk through flooded underpasses or flowing water.",
      ],
      emergencyHelplines: {
        ndma: "1070",
        stateEmergency: "1077",
        coastGuard: "1554",
        ambulance: "108",
      },
      source: isLive ? "live" : "demo",
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error("[disaster-api] error:", error)
    return NextResponse.json(
      { error: "आपदा चेतावनी डेटा प्राप्त करने में त्रुटि हुई।" },
      { status: 500 }
    )
  }
}
