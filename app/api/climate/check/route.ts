import { type NextRequest, NextResponse } from 'next/server'
import {
  checkClimateThreshold,
  getClimateThresholds,
  getAuthenticatedUserId,
} from '@/lib/climate-alerts'
import { getMongoDb } from '@/lib/mongodb'
import { getClimateNormals } from '@/lib/climate-data'

export async function GET(req: NextRequest) {
  return handleClimateCheck(req)
}

export async function POST(req: NextRequest) {
  return handleClimateCheck(req)
}

async function handleClimateCheck(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    let city = searchParams.get('city') || 'Delhi'
    let customVal: number | undefined

    if (req.method === 'POST') {
      try {
        const body = await req.json()
        if (body.city) city = body.city
        if (typeof body.currentValue === 'number') customVal = body.currentValue
      } catch (_) {}
    }

    const thresholds = getClimateThresholds()
    const userId = await getAuthenticatedUserId()

    // Determine real climate value
    // If custom value not explicitly passed, compute current baseline / seasonal temperature
    let currentValue = customVal
    if (currentValue === undefined) {
      const monthIdx = new Date().getMonth()
      const normals = getClimateNormals(city)
      // Normal average high temperature for the city for the current month
      currentValue = normals[monthIdx]?.avgHigh || 32
    }

    // Run identical reusable threshold check
    const result = await checkClimateThreshold(currentValue, thresholds.threshold1, {
      parameter: 'Temperature',
      city,
      isDemo: false,
      userId,
    })

    // Retrieve recent alerts from 'climate_alerts' collection
    let recentAlerts: any[] = []
    try {
      const db = await getMongoDb()
      recentAlerts = await db
        .collection('climate_alerts')
        .find({ city: { $regex: new RegExp(city, 'i') } })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
    } catch (_) {}

    return NextResponse.json({
      success: true,
      thresholds: {
        threshold1: thresholds.threshold1,
        threshold2: thresholds.threshold2,
        threshold3: thresholds.threshold3,
        cooldownMinutes: thresholds.cooldownMinutes,
      },
      monitoring: result,
      recentAlerts,
    })
  } catch (err: any) {
    console.error('Error in /api/climate/check:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Error checking climate threshold' },
      { status: 500 }
    )
  }
}
