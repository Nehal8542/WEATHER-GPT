import { type NextRequest, NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'
import {
  normalizePhoneNumber,
  formatWelcomeMessage,
  sendTwilioMessage,
  WeatherSubscriber,
} from '@/lib/notifications'

// In-memory fallback if MongoDB is not configured or temporarily unreachable
const inMemorySubscribers = new Map<string, WeatherSubscriber>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phoneNumber, city, channels, alertType, sendHour } = body

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid phone number is required' },
        { status: 400 }
      )
    }

    if (!city || typeof city !== 'string') {
      return NextResponse.json(
        { success: false, error: 'City is required' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber)

    // Validate selected channels (at least one of 'sms' or 'whatsapp')
    const validChannels: ('sms' | 'whatsapp')[] = Array.isArray(channels)
      ? channels.filter((c: string) => c === 'sms' || c === 'whatsapp')
      : ['sms']

    if (validChannels.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one channel (SMS or WhatsApp)' },
        { status: 400 }
      )
    }

    const subscriberData: WeatherSubscriber = {
      phoneNumber: normalizedPhone,
      city: city.trim(),
      channels: validChannels,
      alertType: alertType || 'all',
      sendHour: typeof sendHour === 'number' ? sendHour : 8,
      isActive: true,
      updatedAt: new Date().toISOString(),
    }

    let storageUsed = 'memory'

    try {
      const db = await getMongoDb()
      await db.collection('alert_subscribers').updateOne(
        { phoneNumber: normalizedPhone },
        {
          $set: subscriberData,
          $setOnInsert: { createdAt: new Date().toISOString() },
        },
        { upsert: true }
      )
      storageUsed = 'mongodb'
    } catch (dbErr) {
      console.warn('MongoDB not available for alert subscription, using in-memory store:', dbErr)
      inMemorySubscribers.set(normalizedPhone, {
        ...subscriberData,
        createdAt: inMemorySubscribers.get(normalizedPhone)?.createdAt || new Date().toISOString(),
      })
    }

    // Send immediate welcome / confirmation message
    const welcomeMsg = formatWelcomeMessage(subscriberData.city, validChannels)
    const sendResults = []

    for (const channel of validChannels) {
      const res = await sendTwilioMessage({
        to: normalizedPhone,
        channel,
        body: welcomeMsg,
      })
      sendResults.push(res)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to automated alerts for ${subscriberData.city}!`,
      subscriber: subscriberData,
      storage: storageUsed,
      dispatched: sendResults,
    })
  } catch (err: any) {
    console.error('Subscription error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone parameter is required' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhoneNumber(phone)

    try {
      const db = await getMongoDb()
      const record = await db.collection('alert_subscribers').findOne({ phoneNumber: normalizedPhone })
      if (record) {
        return NextResponse.json({ success: true, subscriber: record })
      }
    } catch (dbErr) {
      // Fallback
    }

    const memRecord = inMemorySubscribers.get(normalizedPhone)
    if (memRecord) {
      return NextResponse.json({ success: true, subscriber: memRecord })
    }

    return NextResponse.json({ success: true, subscriber: null })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error checking subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { phoneNumber } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber)

    try {
      const db = await getMongoDb()
      await db.collection('alert_subscribers').updateOne(
        { phoneNumber: normalizedPhone },
        { $set: { isActive: false, unsubscribedAt: new Date().toISOString() } }
      )
    } catch (dbErr) {
      // Fallback
    }

    if (inMemorySubscribers.has(normalizedPhone)) {
      const existing = inMemorySubscribers.get(normalizedPhone)!
      existing.isActive = false
      inMemorySubscribers.set(normalizedPhone, existing)
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed from automated alerts successfully.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error unsubscribing' },
      { status: 500 }
    )
  }
}
