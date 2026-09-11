import { getMongoDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface ChatHistoryMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  modelUsed?: string
  intent?: string
  location?: string
  showGISMap?: boolean
  gisMapType?: string
}

export interface ChatConversationDocument {
  _id?: ObjectId
  userId: string
  conversationId: string
  title: string
  location?: string
  language?: string
  messages: ChatHistoryMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatConversationSummary {
  conversationId: string
  title: string
  location?: string
  language?: string
  lastMessageSnippet: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

let indexesCreated = false

/**
 * Ensures indexes exist on the `chat_history` collection.
 * Idempotent and runs once per process lifecycle.
 */
export async function ensureChatHistoryIndexes() {
  if (indexesCreated) return
  try {
    const db = await getMongoDb('weathergpt')
    const collection = db.collection<ChatConversationDocument>('chat_history')

    await Promise.all([
      collection.createIndex(
        { userId: 1, updatedAt: -1 },
        { name: 'idx_user_updatedAt' }
      ),
      collection.createIndex(
        { userId: 1, conversationId: 1 },
        { unique: true, name: 'idx_user_conversationId_unique' }
      ),
    ])
    indexesCreated = true
  } catch (err) {
    console.warn('[chat_history] Index creation notice:', err)
  }
}

/**
 * Deterministically generates a clean, concise conversation title
 * from the first user query without requiring an extra LLM call.
 */
export function generateDeterministicTitle(rawQuery: string, location?: string): string {
  const query = rawQuery.trim().replace(/^["']|["']$/g, '')
  const lower = query.toLowerCase()

  // If specific city identified
  const city = location?.trim()

  if (city) {
    if (/rain|baarish|barish|monsoon|storm|cloud|वर्षा|बारिश/i.test(lower)) {
      return `${city} Rain & Forecast`
    }
    if (/kheti|crop|agro|farmer|krishi|खेती|फसल/i.test(lower)) {
      return `${city} Farming Advisory`
    }
    if (/flight|aviation|metar|taf|हवाई|विमान/i.test(lower)) {
      return `${city} Aviation Briefing`
    }
    if (/marine|sea|tide|wave|fisher|समुद्री/i.test(lower)) {
      return `${city} Marine Forecast`
    }
    if (/cyclone|flood|toofan|alert|danger|चेतावनी|बाढ़/i.test(lower)) {
      return `${city} Weather Alert`
    }
    if (/aqi|air|pollution|हवा|प्रदूषण/i.test(lower)) {
      return `${city} Air Quality (AQI)`
    }
    return `${city} Weather`
  }

  // Fallback: Clean up first 35 chars
  const cleaned = query
    .replace(/[?!.,;:_/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return 'New Conversation'
  return cleaned.length > 35 ? `${cleaned.slice(0, 32)}...` : cleaned
}

/**
 * Fetches all conversation summaries for a specific authenticated user.
 * Messages array is excluded or summarized for high speed and minimal payload.
 */
export async function getUserConversations(
  userId: string,
  searchQuery?: string
): Promise<ChatConversationSummary[]> {
  await ensureChatHistoryIndexes()
  const db = await getMongoDb('weathergpt')
  const collection = db.collection<ChatConversationDocument>('chat_history')

  const filter: any = { userId }
  if (searchQuery && searchQuery.trim()) {
    const regex = new RegExp(searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [
      { title: regex },
      { location: regex },
      { 'messages.content': regex },
    ]
  }

  const docs = await collection
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(100)
    .toArray()

  return docs.map((doc) => {
    const msgs = doc.messages || []
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user')
    const lastMsg = msgs[msgs.length - 1]
    const snippet = (lastUserMsg?.content || lastMsg?.content || doc.title).slice(0, 70)

    return {
      conversationId: doc.conversationId,
      title: doc.title || 'Weather Query',
      location: doc.location,
      language: doc.language,
      lastMessageSnippet: snippet,
      messageCount: msgs.length,
      createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    }
  })
}

/**
 * Retrieves a single conversation by conversationId for the authenticated user.
 * Returns null if not found or belongs to another user.
 */
export async function getConversation(
  userId: string,
  conversationId: string
): Promise<ChatConversationDocument | null> {
  await ensureChatHistoryIndexes()
  const db = await getMongoDb('weathergpt')
  const collection = db.collection<ChatConversationDocument>('chat_history')

  return collection.findOne({ userId, conversationId })
}

/**
 * Atomically saves a message pair (user message and assistant response)
 * to an existing or new conversation for the authenticated user.
 */
export async function saveConversationMessages(params: {
  userId: string
  conversationId: string
  userMessage: {
    id: string
    content: string
    timestamp?: number
  }
  assistantMessage: {
    id: string
    content: string
    timestamp?: number
    modelUsed?: string
    intent?: string
    showGISMap?: boolean
    gisMapType?: string
  }
  location?: string
  language?: string
  customTitle?: string
}): Promise<{ conversationId: string; title: string }> {
  await ensureChatHistoryIndexes()
  const db = await getMongoDb('weathergpt')
  const collection = db.collection<ChatConversationDocument>('chat_history')

  const now = new Date()

  // Format message objects
  const userMsg: ChatHistoryMessage = {
    id: params.userMessage.id,
    role: 'user',
    content: params.userMessage.content.slice(0, 4000), // Protect against oversized payloads
    timestamp: params.userMessage.timestamp || Date.now(),
    location: params.location,
  }

  const assistantMsg: ChatHistoryMessage = {
    id: params.assistantMessage.id,
    role: 'assistant',
    content: params.assistantMessage.content.slice(0, 10000),
    timestamp: params.assistantMessage.timestamp || Date.now(),
    modelUsed: params.assistantMessage.modelUsed,
    intent: params.assistantMessage.intent,
    showGISMap: params.assistantMessage.showGISMap,
    gisMapType: params.assistantMessage.gisMapType,
  }

  // Check if conversation exists
  const existing = await collection.findOne(
    { userId: params.userId, conversationId: params.conversationId },
    { projection: { _id: 1, title: 1 } }
  )

  let title = params.customTitle || existing?.title
  if (!title) {
    title = generateDeterministicTitle(params.userMessage.content, params.location)
  }

  if (existing) {
    await collection.updateOne(
      { userId: params.userId, conversationId: params.conversationId },
      {
        $push: { messages: { $each: [userMsg, assistantMsg] } },
        $set: {
          updatedAt: now,
          ...(params.location ? { location: params.location } : {}),
          ...(params.language ? { language: params.language } : {}),
        },
      }
    )
  } else {
    await collection.insertOne({
      userId: params.userId,
      conversationId: params.conversationId,
      title,
      location: params.location,
      language: params.language || 'hi',
      messages: [userMsg, assistantMsg],
      createdAt: now,
      updatedAt: now,
    })
  }

  return {
    conversationId: params.conversationId,
    title,
  }
}

/**
 * Deletes a single conversation belonging to the authenticated user.
 */
export async function deleteConversation(userId: string, conversationId: string): Promise<boolean> {
  await ensureChatHistoryIndexes()
  const db = await getMongoDb('weathergpt')
  const collection = db.collection<ChatConversationDocument>('chat_history')

  const res = await collection.deleteOne({ userId, conversationId })
  return res.deletedCount > 0
}

/**
 * Clears ALL conversations for the authenticated user.
 * Does not touch Better Auth collections or other users' data.
 */
export async function clearAllConversations(userId: string): Promise<number> {
  await ensureChatHistoryIndexes()
  const db = await getMongoDb('weathergpt')
  const collection = db.collection<ChatConversationDocument>('chat_history')

  const res = await collection.deleteMany({ userId })
  return res.deletedCount
}

/**
 * Renames a conversation title for the authenticated user.
 */
export async function renameConversation(
  userId: string,
  conversationId: string,
  newTitle: string
): Promise<boolean> {
  await ensureChatHistoryIndexes()
  const db = await getMongoDb('weathergpt')
  const collection = db.collection<ChatConversationDocument>('chat_history')

  const trimmed = newTitle.trim().slice(0, 80)
  if (!trimmed) return false

  const res = await collection.updateOne(
    { userId, conversationId },
    { $set: { title: trimmed, updatedAt: new Date() } }
  )
  return res.matchedCount > 0
}
