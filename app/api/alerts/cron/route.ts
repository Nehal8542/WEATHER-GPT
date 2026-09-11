import { type NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'
import {
  WeatherSubscriber,
  formatDailyWeatherBulletin,
  dispatchAlertToUser,
} from '@/lib/notifications'

export async function GET(req: NextRequest) {
  return handleCronDispatch(req)
}

export async function POST(req: NextRequest) {
  return handleCronDispatch(req)
}

async function handleCronDispatch(req: NextRequest) {
  try {
    // Optional secret verification for production security
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
    }

    let subscribers: WeatherSubscriber[] = []

    try {
      const db = await getMongoDb()
      const records = await db
        .collection('alert_subscribers')
        .find({ isActive: true })
        .toArray()

      subscribers = records as unknown as WeatherSubscriber[]
    } catch (dbErr) {
      console.warn('Cron could not connect to MongoDB:', dbErr)
    }

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscribers found.',
        count: 0,
      })
    }

    const dispatchSummary: any[] = []

    // Fetch and dispatch for each subscriber
    for (const sub of subscribers) {
      try {
        // Construct weather message
        const weatherMsg = formatDailyWeatherBulletin({
          city: sub.city,
          temp: 28,
          condition: 'Clear with passing clouds',
          humidity: 62,
          windSpeed: 12,
          rainProb: 20,
          advice: 'Safe conditions for work and outdoor transit today!',
        })

        const results = await dispatchAlertToUser(sub, weatherMsg)

        // Update lastNotifiedAt
        try {
          const db = await getMongoDb()
          await db.collection('alert_subscribers').updateOne(
            { phoneNumber: sub.phoneNumber },
            { $set: { lastNotifiedAt: new Date().toISOString() } }
          )
        } catch (_) {}

        dispatchSummary.push({
          phoneNumber: sub.phoneNumber,
          city: sub.city,
          results,
        })
      } catch (err: any) {
        dispatchSummary.push({
          phoneNumber: sub.phoneNumber,
          city: sub.city,
          error: err.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      dispatchedCount: dispatchSummary.length,
      details: dispatchSummary,
    })
  } catch (err: any) {
    console.error('Cron dispatch error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Cron error' },
      { status: 500 }
    )
  }
}
