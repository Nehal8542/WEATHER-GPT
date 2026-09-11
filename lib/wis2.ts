/**
 * WMO Information System 2.0 (WIS 2.0) Telemetry & MQTT Simulator Engine
 * Compliant with WMO Manual on the WMO Information System (WMO-No. 1061)
 * Standard Topic Hierarchy: origin/a/wis2/{centre-id}/data/core/...
 */

export interface WIS2Message {
  id: string
  specversion: "v1.0"
  type: "Feature"
  time: string
  topic: string
  stationId: string
  stationName: string
  stationType: "AWS" | "DWR" | "BUOY" | "AGROMET"
  geometry: {
    type: "Point"
    coordinates: [number, number, number] // [lon, lat, elev_m]
  }
  properties: {
    wmoIndex: number
    centreId: string
    pubtime: string
    format: "bufr4" | "geojson" | "csv" | "netcdf"
    sizeBytes: number
    integrityHash: string
  }
  telemetry: {
    temperatureC: number
    dewPointC: number
    relativeHumidityPct: number
    pressureHpa: number
    windSpeedMps: number
    windDirectionDeg: number
    rainRateMmH: number
    solarRadiationWm2?: number
    soilMoisturePct?: number
    waveHeightM?: number
    radarReflectivityDbz?: number
    batteryVolts: number
    qualityCode: 1 | 2 | 3 // 1: Passed QC, 2: Suspect, 3: Erroneous
  }
}

export const INDIAN_WMO_STATIONS = [
  { wmoIndex: 42182, name: "New Delhi (Safdarjung)", state: "Delhi", type: "AWS" as const, coords: [77.2090, 28.5830, 216] as [number, number, number], centre: "in-imd-delhi" },
  { wmoIndex: 43003, name: "Mumbai (Colaba Coastal)", state: "Maharashtra", type: "AWS" as const, coords: [72.8150, 18.9067, 11] as [number, number, number], centre: "in-imd-mumbai" },
  { wmoIndex: 43279, name: "Chennai (Meenambakkam)", state: "Tamil Nadu", type: "DWR" as const, coords: [80.1800, 12.9900, 16] as [number, number, number], centre: "in-imd-chennai" },
  { wmoIndex: 42809, name: "Kolkata (Alipore)", state: "West Bengal", type: "AWS" as const, coords: [88.3300, 22.5300, 6] as [number, number, number], centre: "in-imd-kolkata" },
  { wmoIndex: 43371, name: "Thiruvananthapuram (Coastal)", state: "Kerala", type: "AWS" as const, coords: [76.9500, 8.4800, 64] as [number, number, number], centre: "in-imd-trivandrum" },
  { wmoIndex: 43192, name: "Goa (Mormugao Port)", state: "Goa", type: "AWS" as const, coords: [73.8000, 15.4200, 15] as [number, number, number], centre: "in-imd-panaji" },
  { wmoIndex: 43128, name: "Hyderabad (Begumpet)", state: "Telangana", type: "AWS" as const, coords: [78.4700, 17.4500, 531] as [number, number, number], centre: "in-imd-hyderabad" },
  { wmoIndex: 42369, name: "Lucknow (Amausi)", state: "Uttar Pradesh", type: "AGROMET" as const, coords: [80.8800, 26.7600, 128] as [number, number, number], centre: "in-imd-lucknow" },
  { wmoIndex: 43501, name: "NIOT Bay of Bengal Moored Buoy BD09", state: "Bay of Bengal", type: "BUOY" as const, coords: [89.6000, 17.5000, 0] as [number, number, number], centre: "in-incois-hyderabad" },
  { wmoIndex: 43502, name: "NIOT Arabian Sea Deep Buoy AD02", state: "Arabian Sea", type: "BUOY" as const, coords: [69.0000, 15.0000, 0] as [number, number, number], centre: "in-incois-hyderabad" },
  { wmoIndex: 42410, name: "Guwahati (Bhorjhar)", state: "Assam", type: "DWR" as const, coords: [91.5800, 26.1000, 54] as [number, number, number], centre: "in-imd-guwahati" },
]

export function generateWIS2Message(station?: typeof INDIAN_WMO_STATIONS[0]): WIS2Message {
  const s = station || INDIAN_WMO_STATIONS[Math.floor(Math.random() * INDIAN_WMO_STATIONS.length)]
  const now = new Date()
  const randomId = Math.random().toString(36).substring(2, 10)
  
  // Topic path conforming to WMO WIS 2.0 standard
  const topic = `origin/a/wis2/${s.centre}/data/core/weather/surface-based-observations/${s.type.toLowerCase()}`

  // Telemetry simulation with realistic ranges
  const temp = Number((22 + Math.random() * 14).toFixed(1))
  const rh = Math.floor(45 + Math.random() * 45)
  const dewPoint = Number((temp - ((100 - rh) / 5)).toFixed(1))
  const pressure = Number((1008 + (Math.random() * 8 - 4)).toFixed(1))
  const windSpeed = Number((1.5 + Math.random() * 9).toFixed(1))
  const windDir = Math.floor(Math.random() * 360)
  const rain = Math.random() > 0.65 ? Number((Math.random() * 12).toFixed(1)) : 0

  return {
    id: `urn:wmo:md:${s.centre}::${s.wmoIndex}-${now.toISOString().replace(/[:.]/g, "")}-${randomId}`,
    specversion: "v1.0",
    type: "Feature",
    time: now.toISOString(),
    topic,
    stationId: `IN-WMO-${s.wmoIndex}`,
    stationName: s.name,
    stationType: s.type,
    geometry: {
      type: "Point",
      coordinates: s.coords,
    },
    properties: {
      wmoIndex: s.wmoIndex,
      centreId: s.centre,
      pubtime: now.toISOString(),
      format: s.type === "DWR" ? "netcdf" : "bufr4",
      sizeBytes: Math.floor(1240 + Math.random() * 8400),
      integrityHash: `sha256:${Math.random().toString(16).substring(2, 18)}`,
    },
    telemetry: {
      temperatureC: temp,
      dewPointC: dewPoint,
      relativeHumidityPct: rh,
      pressureHpa: pressure,
      windSpeedMps: windSpeed,
      windDirectionDeg: windDir,
      rainRateMmH: rain,
      solarRadiationWm2: s.type === "AGROMET" ? Math.floor(300 + Math.random() * 550) : undefined,
      soilMoisturePct: s.type === "AGROMET" ? Math.floor(20 + Math.random() * 40) : undefined,
      waveHeightM: s.type === "BUOY" ? Number((1.2 + Math.random() * 2.8).toFixed(1)) : undefined,
      radarReflectivityDbz: s.type === "DWR" ? Math.floor(15 + Math.random() * 40) : undefined,
      batteryVolts: Number((12.4 + Math.random() * 0.8).toFixed(2)),
      qualityCode: 1,
    }
  }
}
