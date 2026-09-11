import { MongoClient, ServerApiVersion } from 'mongodb'

if (!process.env.MONGODB_URI) {
  // We log a warning instead of throwing at import time so build/other routes don't crash
  console.warn('⚠️ MONGODB_URI environment variable is not defined in .env.local')
}

const uri = process.env.MONGODB_URI || ''
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!uri) {
  clientPromise = Promise.reject(new Error('MONGODB_URI is not set in environment variables.'))
} else if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

/**
 * Helper function to retrieve the MongoDB database instance.
 * @param dbName Optional database name (defaults to database specified in connection string or 'weathergpt')
 */
export async function getMongoDb(dbName = 'weathergpt') {
  const connectedClient = await clientPromise
  return connectedClient.db(dbName)
}
