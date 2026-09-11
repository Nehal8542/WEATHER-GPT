import { type NextRequest, NextResponse } from 'next/server'
import {
  normalizePhoneNumber,
  formatDailyWeatherBulletin,
  sendTwilioMessage,
} from '@/lib/notifications'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phoneNumber, city = 'New Delhi', channels = ['sms', 'whatsapp'] } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required for test alert' },
        { status: 400 }
      )
    }

    const cleanPhone = normalizePhoneNumber(phoneNumber)
    const validChannels = (Array.isArray(channels) ? channels : [channels]).filter(
      (c: string) => c === 'sms' || c === 'whatsapp'
    ) as ('sms' | 'whatsapp')[]

    if (validChannels.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Select at least one channel to test (SMS or WhatsApp)' },
        { status: 400 }
      )
    }

    // Generate weather test payload
    const testBulletin = formatDailyWeatherBulletin({
      city: city || 'New Delhi',
      temp: 29.5,
      feelsLike: 31,
      condition: 'Partly Cloudy with gentle breeze',
      humidity: 58,
      windSpeed: 14,
      rainProb: 15,
      aqi: '112 (Moderate)',
      advice: 'Great weather for outdoor commute. Carry sunglasses! 🕶️',
    })

    const results = []
    for (const ch of validChannels) {
      const res = await sendTwilioMessage({
        to: cleanPhone,
        channel: ch,
        body: testBulletin,
      })
      results.push(res)
    }

    const allSuccessful = results.every((r) => r.success)
    const isSimulated = results.some((r) => r.simulated)

    return NextResponse.json({
      success: allSuccessful,
      results,
      simulated: isSimulated,
      message: isSimulated
        ? 'Test simulated successfully! (Add Twilio credentials in .env.local for real phone delivery)'
        : 'Live test alert sent successfully to your phone!',
    })
  } catch (err: any) {
    console.error('Test alert error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Error executing test alert' },
      { status: 500 }
    )
  }
}
