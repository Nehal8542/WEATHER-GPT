import { type NextRequest, NextResponse } from 'next/server'
import {
  checkClimateThreshold,
  getClimateThresholds,
  getAuthenticatedUserId,
} from '@/lib/climate-alerts'

export async function POST(req: NextRequest) {
  try {
    let simulatedValue = 42.0 // Exceeds default 40.0°C threshold
    let city = 'Delhi'
    let parameter = 'Temperature'

    try {
      const body = await req.json()
      if (typeof body.simulatedValue === 'number') {
        simulatedValue = body.simulatedValue
      }
      if (body.city && typeof body.city === 'string') {
        city = body.city
      }
      if (body.parameter && typeof body.parameter === 'string') {
        parameter = body.parameter
      }
    } catch (_) {
      // Use defaults if empty body
    }

    const thresholds = getClimateThresholds()
    const userId = await getAuthenticatedUserId()

    // SIH REQUIREMENT: Passes the simulated threshold-crossing value
    // through the EXACT SAME function used by real climate data.
    const result = await checkClimateThreshold(simulatedValue, thresholds.threshold1, {
      parameter,
      city,
      isDemo: true,
      userId,
      forceSms: true, // In demo trigger, allow sending test SMS immediately
    })

    return NextResponse.json({
      success: true,
      message: 'Demo climate alert triggered successfully!',
      monitoring: result,
      simulatedValue,
      threshold: thresholds.threshold1,
    })
  } catch (err: any) {
    console.error('Error in /api/climate/demo-alert:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to trigger demo alert' },
      { status: 500 }
    )
  }
}
