export interface GeoLocation {
  name: string
  state?: string
  country: string
  lat: number
  lon: number
}

export interface CurrentWeather {
  temp: number
  feelsLike: number
  humidity: number
  pressure: number
  windSpeed: number
  windDeg: number
  clouds: number
  visibility: number
  condition: string
  description: string
  icon: string
  sunrise: number
  sunset: number
  rain1h?: number
}

export interface ForecastPoint {
  time: number
  temp: number
  tempMin: number
  tempMax: number
  condition: string
  description: string
  icon: string
  pop: number
  windSpeed: number
  rain?: number
}

export interface DailyForecast {
  date: string
  tempMin: number
  tempMax: number
  condition: string
  description: string
  icon: string
  pop: number
}

export interface AirQuality {
  aqi: number
  label: string
  pm25: number
  pm10: number
}

export type AlertSeverity = "advisory" | "watch" | "warning" | "severe"

export interface WeatherAlert {
  id: string
  title: string
  severity: AlertSeverity
  event: string
  description: string
}

export interface ClimateNormal {
  month: string
  avgHigh: number
  avgLow: number
  rainfall: number
}

export interface WeatherPayload {
  location: GeoLocation
  current: CurrentWeather
  hourly: ForecastPoint[]
  daily: DailyForecast[]
  airQuality: AirQuality | null
  alerts: WeatherAlert[]
  climate: ClimateNormal[]
  source: "live" | "demo"
}

export interface AgroPayload {
  location: {
    name: string
    state?: string
    country?: string
    lat: number
    lon: number
  }
  soil: {
    surfaceTemp: number
    depth10Temp: number
    moisture: number
    moistureLabel: string
    updatedAt: string
  }
  farming: {
    sowingAdvice: string
    irrigationAdvice: string
    cropRisk: string
    uvIndex?: number
  }
  source: "live" | "demo"
}

export interface AviationPayload {
  location: GeoLocation
  ceiling: number
  visibility: number
  windSpeed: number
  windDeg: number
  gusts?: number
  temp: number
  dewPoint: number
  qnh: number
  condition: string
  flightCategory: "VFR" | "MVFR" | "IFR" | "LIFR"
  hazards: string[]
  source: "live" | "demo"
}

export interface MarinePayload {
  location: GeoLocation
  seaSurfaceTemp: number        // °C
  waveHeight: number            // meters
  wavePeriod: number            // seconds
  waveDirection: number         // degrees
  swellHeight: number           // meters
  swellPeriod: number           // seconds
  seaState: "Calm (Glassy)" | "Smooth" | "Slight" | "Moderate" | "Rough" | "Very Rough" | "High"
  beaufortScale: number         // 0 - 12
  beaufortDescription: string   // e.g. "Gentle Breeze", "Strong Gale"
  tidalStatus: "High Tide Rising" | "High Tide Ebbing" | "Low Tide Rising" | "Low Tide Falling"
  fishermanWarning: {
    level: "safe" | "caution" | "danger"
    message: string
    maxOffshoreDistanceKm: number
  }
  hourly: Array<{
    time: string
    waveHeight: number
    wavePeriod: number
    windSpeed: number
  }>
  source: "live" | "demo"
}

export interface UrbanPayload {
  location: GeoLocation
  urbanHeatIslandDelta: number  // °C difference vs surrounding rural
  drainageVulnerability: "Low" | "Moderate" | "High" | "Critical Flash Flood Risk"
  waterloggingHotspots: string[]
  thermalComfortUTCI: number    // °C Universal Thermal Climate Index
  thermalComfortCategory: "Comfortable" | "Moderate Heat Stress" | "Strong Heat Stress" | "Extreme Heat Stress"
  constructionClearance: {
    status: "Approved" | "Caution (High Winds/Rain)" | "Halted (Adverse Weather)"
    reason: string
  }
  ventilationCoefficient: number // m²/s (air pollutant dispersion)
  dispersionCategory: "Poor (Smog Accumulation)" | "Moderate" | "Good (Clean Dispersion)"
  source: "live" | "demo"
}

/** Detailed numerical model run specifications (GFS & WRF) */
export interface NWPModelDetails {
  id: "gfs" | "wrf"
  name: string
  resolution: string
  gridPoints: string
  dynamics: string
  convectiveScheme: string
  pblScheme: string
  temp2m: number
  dewPoint: number
  relativeHumidity: number
  windSpeed10m: number
  windDir10m: number
  windGusts: number
  pressure: number
  totalPrecip: number
  cape: number
  cin: number
  liftedIndex: number
  precipitableWater: number
  hourly: Array<{
    time: string
    temp: number
    precip: number
    windSpeed: number
    cape: number
  }>
}

/** NWP (Numerical Weather Prediction) model output — GFS & WRF multi-model integration */
export interface NWPPayload {
  location: GeoLocation
  modelRun: string        // ISO datetime of model initialisation
  model: string           // e.g. "GFS 0.25° vs WRF 3km"
  source: "live" | "demo"

  // Surface layer
  temp2m: number          // 2 m temperature (°C)
  dewPoint: number        // 2 m dew point (°C)
  relativeHumidity: number // %
  windSpeed10m: number    // m/s
  windDir10m: number      // degrees
  windGusts: number       // m/s
  pressure: number        // hPa (QNH)
  totalPrecip: number     // mm accumulated next 24 h
  snowDepth: number       // m
  cape: number            // J/kg — Convective Available Potential Energy
  cin?: number            // J/kg — Convective Inhibition
  liftedIndex: number     // Lifted Index (stability)
  precipitableWater: number  // kg/m²

  // Upper air (500 hPa)
  geopotentialHeight500: number  // m
  temp500: number                // °C
  windSpeed500: number           // m/s

  // 72-hour hourly forecast grid
  hourly: Array<{
    time: string
    temp: number
    precip: number
    windSpeed: number
    cape: number
  }>

  // Multi-model details (GFS + WRF)
  models?: {
    gfs: NWPModelDetails
    wrf: NWPModelDetails
  }
  activeModel?: "gfs" | "wrf"

  // WIS2.0 MQTT signal metadata
  wis2: {
    topic: string
    lastSignalTime: string
    signalCount: number
    connected: boolean
    latencyMs: number
  }
}

/* ── Flood & Cyclone Disaster Early Warning System ── */
export type IMDAlertColor = "Red" | "Orange" | "Yellow" | "Green"

export interface DisasterPayload {
  location: GeoLocation
  timestamp: string
  colorAlert: IMDAlertColor
  colorAlertTitle: string
  actionDirective: string
  cycloneStatus: {
    hasCyclone: boolean
    category:
      | "Super Cyclone"
      | "Extremely Severe Cyclonic Storm (ESCS)"
      | "Very Severe Cyclonic Storm (VSCS)"
      | "Severe Cyclonic Storm (SCS)"
      | "Cyclonic Storm (CS)"
      | "Deep Depression"
      | "No Active Cyclone"
    systemName?: string
    centralPressureHpa: number
    maxSustainedWindKmph: number
    gustsKmph: number
    estimatedLandfall: string
    stormSurgeMeters: number
  }
  floodRisk: {
    level: "High Flash Flood Warning" | "Moderate Inundation Watch" | "Low Basin Flow" | "Normal Flow"
    basinName: string
    waterLevelStatus: "Above Danger Mark" | "Approaching Warning Level" | "Below Warning Level"
    inundationProbabilityPct: number
    criticalBlocks: string[]
  }
  safetyChecklist: string[]
  emergencyHelplines: {
    ndma: string
    stateEmergency: string
    coastGuard: string
    ambulance: string
  }
  source: "live" | "demo"
}

