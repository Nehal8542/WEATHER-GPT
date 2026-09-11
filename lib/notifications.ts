/**
 * WeatherGPT Automated Messaging Engine (SMS & WhatsApp)
 * 
 * Supports both Twilio live delivery and graceful simulated mode.
 */

export interface WeatherSubscriber {
  phoneNumber: string // E.164 format: +919876543210
  city: string
  channels: ('sms' | 'whatsapp')[]
  alertType: 'daily' | 'severe' | 'all'
  sendHour?: number // e.g., 8 (for 8 AM)
  isActive: boolean
  lastNotifiedAt?: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface SendResult {
  channel: 'sms' | 'whatsapp'
  to: string
  success: boolean
  sid?: string
  simulated?: boolean
  error?: string
}

// Clean and normalize phone numbers into E.164 (+<country_code><number>)
export function normalizePhoneNumber(rawNumber: string, defaultCountryCode = '+91'): string {
  let cleaned = rawNumber.replace(/[\s\-\(\)]/g, '')
  if (!cleaned.startsWith('+')) {
    // If starts with 0 (e.g. 09876543210), strip 0
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1)
    }
    // If 10 digits without country code, prepend default country code (+91 for India)
    if (/^\d{10}$/.test(cleaned)) {
      cleaned = `${defaultCountryCode}${cleaned}`
    } else {
      cleaned = `+${cleaned}`
    }
  }
  return cleaned
}

/**
 * Send a message via Twilio REST API (works for both SMS and WhatsApp).
 * If Twilio credentials are missing, operates in safe simulation mode.
 */
export async function sendTwilioMessage({
  to,
  channel,
  body,
}: {
  to: string
  channel: 'sms' | 'whatsapp'
  body: string
}): Promise<SendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromPhone = process.env.TWILIO_PHONE_NUMBER
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || fromPhone

  const cleanTo = normalizePhoneNumber(to)

  // Validate credentials
  const hasLiveCredentials =
    accountSid &&
    authToken &&
    accountSid.startsWith('AC') &&
    !accountSid.includes('your_twilio') &&
    !authToken.includes('your_twilio')

  if (!hasLiveCredentials) {
    // Fallback: Safe simulation mode
    console.log(`[SIMULATED ${channel.toUpperCase()} ALERT]`)
    console.log(`To: ${cleanTo}`)
    console.log(`Message:\n${body}`)
    console.log('--------------------------------------------------')

    return {
      channel,
      to: cleanTo,
      success: true,
      simulated: true,
      sid: `SIM_${channel.toUpperCase()}_${Date.now()}`,
    }
  }

  try {
    const formattedFrom =
      channel === 'whatsapp'
        ? (fromWhatsApp?.startsWith('whatsapp:') ? fromWhatsApp : `whatsapp:${fromWhatsApp}`)
        : fromPhone!

    const formattedTo =
      channel === 'whatsapp'
        ? (cleanTo.startsWith('whatsapp:') ? cleanTo : `whatsapp:${cleanTo}`)
        : cleanTo

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`

    const params = new URLSearchParams()
    params.append('From', formattedFrom)
    params.append('To', formattedTo)
    params.append('Body', body)

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`Twilio ${channel} error:`, data)
      return {
        channel,
        to: cleanTo,
        success: false,
        error: data.message || `Twilio error: ${response.statusText}`,
      }
    }

    return {
      channel,
      to: cleanTo,
      success: true,
      simulated: false,
      sid: data.sid,
    }
  } catch (err: any) {
    console.error(`Failed to send ${channel} via Twilio:`, err)
    return {
      channel,
      to: cleanTo,
      success: false,
      error: err.message || 'Network error while contacting Twilio API',
    }
  }
}

/**
 * Format welcome / confirmation message
 */
export function formatWelcomeMessage(city: string, channels: ('sms' | 'whatsapp')[]): string {
  const channelText =
    channels.length === 2
      ? 'SMS & WhatsApp'
      : channels[0] === 'whatsapp'
      ? 'WhatsApp'
      : 'SMS'

  return `🌤️ *WeatherGPT Alert Activated!*\n\nNamaste! You will now receive automated weather bulletins for *${city}* via ${channelText}.\n\n📅 Morning Forecast: 8:00 AM Daily\n⚡ Severe Storm & Rain Warnings: Real-time\n\nStay prepared and safe! 🚀`
}

/**
 * Format daily morning weather bulletin
 */
export function formatDailyWeatherBulletin({
  city,
  temp,
  feelsLike,
  condition,
  humidity,
  windSpeed,
  rainProb,
  aqi,
  advice,
}: {
  city: string
  temp: number
  feelsLike?: number
  condition: string
  humidity: number
  windSpeed: number
  rainProb?: number
  aqi?: number | string
  advice?: string
}): string {
  const rainText = rainProb !== undefined ? `\n🌧️ Rain Chance: ${rainProb}%` : ''
  const aqiText = aqi ? `\n🍃 Air Quality (AQI): ${aqi}` : ''
  const tip = advice || (rainProb && rainProb > 40 ? 'Carry an umbrella today!' : 'Have a wonderful day!')

  return `🌅 *WeatherGPT Morning Update: ${city}*\n\n` +
    `🌡️ Temp: ${Math.round(temp)}°C${feelsLike ? ` (Feels like ${Math.round(feelsLike)}°C)` : ''}\n` +
    `⛅ Condition: ${condition}\n` +
    `💧 Humidity: ${humidity}%\n` +
    `💨 Wind: ${windSpeed} km/h` +
    rainText +
    aqiText +
    `\n\n💡 *Tip:* ${tip}\n\n_Reply STOP to unsubscribe._`
}

/**
 * Format severe storm / extreme weather alert
 */
export function formatSevereWeatherAlert({
  city,
  alertTitle,
  severity,
  instructions,
}: {
  city: string
  alertTitle: string
  severity: 'Red' | 'Orange' | 'Yellow' | string
  instructions: string
}): string {
  const badge = severity.toUpperCase() === 'RED' ? '🔴 RED ALERT' : '🟠 ORANGE WARNING'
  return `⚠️ *WeatherGPT SEVERE WEATHER ALERT: ${city}*\n\n` +
    `🚨 ${badge}: ${alertTitle}\n\n` +
    `📋 Safety Instructions:\n${instructions}\n\n` +
    `📞 Disaster Helpline: 1070 (NDMA) | 1077 (District Control)\n` +
    `Stay indoors and safe!`
}

/**
 * Dispatches notification to all requested channels for a user
 */
export async function dispatchAlertToUser(
  subscriber: WeatherSubscriber,
  message: string
): Promise<SendResult[]> {
  const results: SendResult[] = []

  for (const channel of subscriber.channels) {
    const res = await sendTwilioMessage({
      to: subscriber.phoneNumber,
      channel,
      body: message,
    })
    results.push(res)
  }

  return results
}
