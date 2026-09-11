import type { ClimateNormal } from "./weather-types"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface CityClimate {
  highs: number[]
  lows: number[]
  rain: number[]
}

const CITY_CLIMATE: Record<string, CityClimate> = {
  // Major Metros
  delhi: {
    highs: [21, 24, 30, 37, 40, 39, 35, 34, 34, 33, 29, 23],
    lows:  [7, 10, 15, 21, 26, 28, 27, 26, 25, 19, 12, 8],
    rain:  [19, 20, 15, 12, 30, 75, 195, 210, 120, 15, 5, 8],
  },
  mumbai: {
    highs: [31, 31, 33, 33, 33, 32, 30, 30, 31, 34, 34, 32],
    lows:  [17, 18, 22, 25, 27, 27, 26, 25, 25, 24, 22, 19],
    rain:  [1, 1, 0, 1, 12, 490, 840, 545, 320, 90, 20, 5],
  },
  chennai: {
    highs: [29, 31, 33, 35, 38, 37, 35, 35, 34, 32, 29, 28],
    lows:  [21, 22, 24, 26, 28, 28, 27, 26, 26, 24, 23, 22],
    rain:  [24, 7, 15, 25, 52, 53, 84, 124, 118, 267, 309, 191],
  },
  kolkata: {
    highs: [27, 30, 34, 36, 36, 34, 32, 32, 32, 32, 30, 27],
    lows:  [14, 17, 22, 25, 26, 27, 26, 26, 26, 24, 19, 14],
    rain:  [16, 22, 32, 47, 117, 259, 332, 329, 296, 152, 26, 6],
  },
  bengaluru: {
    highs: [28, 31, 33, 34, 33, 29, 28, 28, 28, 28, 27, 27],
    lows:  [15, 17, 19, 21, 21, 20, 19, 19, 19, 19, 17, 15],
    rain:  [3, 7, 9, 46, 120, 81, 110, 137, 195, 180, 65, 22],
  },
  hyderabad: {
    highs: [29, 32, 36, 38, 39, 34, 30, 29, 30, 31, 29, 28],
    lows:  [15, 17, 21, 25, 27, 25, 23, 23, 23, 21, 17, 14],
    rain:  [8, 10, 12, 25, 30, 110, 165, 175, 165, 75, 25, 6],
  },
  // North India
  lucknow: {
    highs: [22, 25, 32, 38, 41, 39, 34, 33, 34, 33, 29, 23],
    lows:  [8, 11, 16, 22, 27, 29, 28, 27, 26, 20, 13, 9],
    rain:  [22, 18, 11, 8, 26, 80, 215, 275, 165, 25, 8, 12],
  },
  patna: {
    highs: [23, 26, 33, 38, 39, 37, 33, 33, 33, 32, 29, 24],
    lows:  [9, 12, 18, 24, 27, 28, 27, 27, 26, 21, 14, 10],
    rain:  [18, 16, 10, 8, 36, 120, 275, 305, 205, 60, 10, 8],
  },
  jaipur: {
    highs: [22, 25, 31, 37, 41, 40, 36, 34, 35, 34, 29, 24],
    lows:  [8, 10, 16, 22, 27, 29, 27, 26, 24, 18, 12, 8],
    rain:  [11, 8, 7, 5, 15, 55, 185, 200, 75, 15, 5, 6],
  },
  chandigarh: {
    highs: [17, 20, 26, 33, 38, 38, 34, 33, 33, 31, 26, 19],
    lows:  [5, 7, 12, 18, 23, 26, 26, 25, 23, 16, 10, 6],
    rain:  [36, 40, 32, 18, 40, 88, 210, 210, 108, 25, 10, 24],
  },
  amritsar: {
    highs: [15, 18, 24, 32, 38, 40, 37, 35, 34, 32, 24, 17],
    lows:  [4, 6, 11, 17, 23, 27, 28, 27, 24, 16, 9, 5],
    rain:  [38, 45, 36, 20, 28, 50, 205, 190, 70, 14, 8, 28],
  },
  shimla: {
    highs: [9, 10, 14, 19, 23, 24, 20, 20, 20, 19, 15, 11],
    lows:  [2, 3, 6, 10, 14, 17, 16, 16, 14, 10, 6, 3],
    rain:  [62, 65, 62, 38, 55, 148, 450, 388, 145, 40, 18, 48],
  },
  dehradun: {
    highs: [20, 22, 27, 33, 37, 36, 32, 31, 30, 30, 26, 21],
    lows:  [6, 8, 13, 18, 22, 24, 23, 23, 21, 15, 9, 6],
    rain:  [52, 55, 35, 25, 60, 205, 465, 395, 210, 50, 18, 38],
  },
  // South India
  kochi: {
    highs: [31, 32, 32, 32, 31, 29, 29, 29, 29, 30, 30, 30],
    lows:  [23, 24, 26, 27, 27, 25, 24, 24, 24, 24, 24, 23],
    rain:  [18, 18, 36, 130, 330, 630, 540, 440, 255, 290, 170, 45],
  },
  thiruvananthapuram: {
    highs: [31, 32, 33, 33, 32, 29, 29, 29, 30, 30, 30, 31],
    lows:  [22, 23, 25, 26, 27, 25, 24, 24, 24, 23, 23, 22],
    rain:  [23, 22, 45, 130, 290, 550, 470, 360, 210, 270, 210, 55],
  },
  visakhapatnam: {
    highs: [28, 30, 33, 35, 37, 36, 33, 33, 32, 31, 29, 27],
    lows:  [20, 21, 24, 27, 29, 29, 27, 27, 26, 24, 22, 20],
    rain:  [12, 8, 14, 25, 60, 90, 155, 170, 185, 195, 85, 20],
  },
  madurai: {
    highs: [30, 33, 36, 38, 38, 37, 35, 35, 34, 32, 29, 28],
    lows:  [20, 21, 23, 25, 27, 27, 26, 26, 25, 24, 23, 21],
    rain:  [28, 10, 20, 45, 55, 30, 50, 90, 110, 195, 160, 80],
  },
  // West India
  ahmedabad: {
    highs: [28, 31, 36, 40, 42, 39, 35, 33, 34, 35, 32, 29],
    lows:  [12, 14, 19, 24, 28, 29, 27, 26, 26, 22, 16, 12],
    rain:  [3, 2, 3, 2, 8, 50, 210, 195, 70, 10, 5, 2],
  },
  pune: {
    highs: [30, 33, 36, 38, 37, 32, 28, 28, 29, 30, 30, 29],
    lows:  [10, 12, 16, 20, 22, 22, 22, 21, 20, 17, 13, 10],
    rain:  [3, 2, 3, 15, 50, 115, 180, 165, 105, 55, 18, 5],
  },
  surat: {
    highs: [29, 31, 34, 37, 37, 35, 32, 31, 32, 34, 33, 30],
    lows:  [15, 16, 20, 24, 27, 27, 26, 26, 26, 23, 19, 15],
    rain:  [2, 1, 2, 1, 12, 125, 520, 430, 165, 20, 8, 2],
  },
  // East India
  bhubaneswar: {
    highs: [28, 31, 35, 38, 38, 35, 32, 32, 32, 32, 30, 27],
    lows:  [15, 17, 21, 25, 27, 27, 26, 26, 26, 23, 18, 14],
    rain:  [22, 28, 25, 40, 85, 190, 315, 360, 250, 165, 40, 18],
  },
  guwahati: {
    highs: [22, 24, 29, 31, 30, 30, 30, 31, 30, 29, 26, 23],
    lows:  [9, 12, 16, 20, 22, 24, 25, 25, 24, 20, 14, 9],
    rain:  [12, 20, 55, 140, 250, 355, 395, 330, 240, 130, 22, 8],
  },
  // Hill Stations
  srinagar: {
    highs: [5, 8, 14, 20, 25, 30, 33, 32, 28, 22, 13, 6],
    lows:  [-3, -1, 4, 9, 13, 17, 20, 19, 15, 8, 2, -2],
    rain:  [60, 75, 80, 55, 50, 28, 25, 32, 25, 35, 40, 55],
  },
  // More cities
  varanasi: {
    highs: [22, 26, 33, 39, 41, 39, 34, 33, 34, 33, 29, 23],
    lows:  [9, 12, 17, 23, 28, 29, 27, 27, 26, 20, 13, 9],
    rain:  [18, 15, 10, 6, 22, 90, 230, 275, 185, 35, 8, 10],
  },
  nagpur: {
    highs: [29, 32, 37, 40, 42, 37, 31, 30, 31, 33, 31, 28],
    lows:  [13, 15, 20, 25, 29, 27, 24, 24, 23, 21, 16, 12],
    rain:  [15, 14, 12, 12, 22, 160, 280, 270, 175, 60, 24, 14],
  },
  indore: {
    highs: [26, 29, 34, 38, 40, 37, 31, 29, 31, 32, 30, 26],
    lows:  [11, 13, 17, 22, 27, 26, 24, 23, 23, 19, 14, 11],
    rain:  [14, 10, 10, 8, 18, 130, 295, 290, 180, 40, 18, 12],
  },
  raipur: {
    highs: [29, 32, 37, 41, 42, 37, 31, 30, 31, 32, 31, 28],
    lows:  [13, 15, 19, 24, 28, 27, 25, 25, 25, 21, 15, 12],
    rain:  [18, 18, 12, 8, 22, 170, 340, 360, 275, 90, 20, 12],
  },
}

const DEFAULT_CLIMATE: CityClimate = {
  highs: [25, 27, 31, 35, 37, 35, 32, 31, 31, 30, 27, 24],
  lows:  [12, 14, 19, 24, 27, 27, 26, 25, 24, 20, 15, 11],
  rain:  [15, 18, 14, 18, 45, 140, 240, 235, 165, 70, 20, 10],
}

export function getClimateNormals(city: string): ClimateNormal[] {
  const key = city.toLowerCase().trim()
  const data =
    CITY_CLIMATE[key] ??
    Object.entries(CITY_CLIMATE).find(([k]) => key.includes(k) || k.includes(key.split(" ")[0]))?.[1] ??
    DEFAULT_CLIMATE
  return MONTHS.map((month, i) => ({
    month,
    avgHigh: data.highs[i],
    avgLow: data.lows[i],
    rainfall: data.rain[i],
  }))
}

export interface ClimateAnomalyReport {
  city: string
  currentMonth: string
  normalHigh: number
  normalLow: number
  normalMonthlyRainMm: number
  tempAnomaly: number // e.g. +2.5 or -1.2
  status: "Normal" | "Above Normal" | "Heatwave Warning" | "Below Normal" | "Cold Wave Warning"
  summaryText: string
}

export function calculateClimateAnomaly(city: string, currentTemp: number): ClimateAnomalyReport {
  const monthIdx = new Date().getMonth()
  const normals = getClimateNormals(city)
  const norm = normals[monthIdx]
  
  const diff = Number((currentTemp - norm.avgHigh).toFixed(1))
  let status: ClimateAnomalyReport["status"] = "Normal"
  
  if (diff >= 4.5) {
    status = "Heatwave Warning"
  } else if (diff >= 2.0) {
    status = "Above Normal"
  } else if (diff <= -4.5) {
    status = "Cold Wave Warning"
  } else if (diff <= -2.0) {
    status = "Below Normal"
  }

  const sign = diff >= 0 ? `+${diff}` : `${diff}`
  const summaryText = `30-Yr IMD Baseline for ${norm.month}: Normal Max ${norm.avgHigh}°C (Current is ${sign}°C vs normal · ${status}). Normal Rain: ${norm.rainfall}mm.`

  return {
    city,
    currentMonth: norm.month,
    normalHigh: norm.avgHigh,
    normalLow: norm.avgLow,
    normalMonthlyRainMm: norm.rainfall,
    tempAnomaly: diff,
    status,
    summaryText,
  }
}

