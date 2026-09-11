import { NextResponse } from 'next/server'
import clientPromise, { getMongoDb } from '@/lib/mongodb'

export async function GET() {
  const uri = process.env.MONGODB_URI || ''

  if (!uri) {
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: 'MONGODB_URI is not configured in .env.local',
      },
      { status: 500 }
    )
  }

  if (uri.includes('<db_username>') || uri.includes('<username>')) {
    return NextResponse.json(
      {
        success: false,
        status: 'misconfigured',
        message:
          'MONGODB_URI still contains placeholder `<db_username>`. Please replace `<db_username>` with your Atlas Database User username.',
      },
      { status: 400 }
    )
  }

  try {
    const startTime = Date.now()
    const client = await clientPromise
    const admin = client.db().admin()
    const pingResult = await admin.ping()
    const latency = Date.now() - startTime

    return NextResponse.json({
      success: true,
      status: 'connected',
      message: 'MongoDB Atlas connection established successfully!',
      ping: pingResult,
      latencyMs: latency,
      database: 'weathergpt',
    })
  } catch (error: any) {
    console.error('MongoDB connection error:', error)
    return NextResponse.json(
      {
        success: false,
        status: 'connection_failed',
        error: error.message,
        hint:
          error.message?.includes('SSL') || error.message?.includes('tlsv1')
            ? 'SSL/TLS handshake rejected. Verify that: 1) Your database username/password are correct in Atlas Database Access. 2) Your IP address is added to Atlas Network Access (or 0.0.0.0/0 is allowed for development).'
            : 'Check network connectivity, database credentials, and cluster status.',
      },
      { status: 500 }
    )
  }
}
