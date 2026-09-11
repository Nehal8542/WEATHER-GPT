import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { MongoClient } from 'mongodb'

function resolveBaseURL() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.V0_RUNTIME_URL
}

function resolveTrustedOrigins() {
  const origins = new Set<string>()
  if (process.env.NODE_ENV === 'development') {
    origins.add('http://localhost:3000')
    for (const key of ['V0_RUNTIME_URL', 'V0_DEV_APP_URL', 'V0_BUILD_URL', 'V0_SANDBOX_URL']) {
      const value = process.env[key]
      if (value) origins.add(value)
    }
  } else {
    if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`)
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
      origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }
  return [...origins]
}

declare global {
  // eslint-disable-next-line no-var
  var _betterAuthMongoClient: MongoClient | undefined
}

function getDatabase() {
  const mongoUri = process.env.MONGODB_URI
  if (mongoUri && !mongoUri.includes('<db_username>')) {
    if (!global._betterAuthMongoClient) {
      global._betterAuthMongoClient = new MongoClient(mongoUri)
    }
    const db = global._betterAuthMongoClient.db('weathergpt')
    return mongodbAdapter(db)
  }
  return undefined
}

const db = getDatabase()

export const auth = betterAuth({
  ...(db ? { database: db } : {}),
  baseURL: resolveBaseURL() || 'http://localhost:3000',
  trustedOrigins: [
    ...resolveTrustedOrigins(),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  emailAndPassword: {
    enabled: true,
  },
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  ...(process.env.V0_RUNTIME_URL
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})

