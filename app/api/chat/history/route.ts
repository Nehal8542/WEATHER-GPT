import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getUserConversations,
  saveConversationMessages,
  clearAllConversations,
} from '@/lib/chat-history'

export const maxDuration = 15

/**
 * GET /api/chat/history
 * Lists all conversations for the authenticated user, sorted by most recent.
 * Optional query parameter: ?q=search_term
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access chat history.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const searchQuery = searchParams.get('q') || undefined

    const conversations = await getUserConversations(session.user.id, searchQuery)
    return NextResponse.json({ conversations })
  } catch (error: any) {
    console.error('[API /api/chat/history GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve chat history' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat/history
 * Saves a user query + AI response pair into MongoDB chat_history.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to save chat history.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      conversationId,
      userMessage,
      assistantMessage,
      location,
      language,
      customTitle,
    } = body

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json({ error: 'Valid conversationId is required' }, { status: 400 })
    }

    if (!userMessage?.content || typeof userMessage.content !== 'string') {
      return NextResponse.json({ error: 'User message content is required' }, { status: 400 })
    }

    if (!assistantMessage?.content || typeof assistantMessage.content !== 'string') {
      return NextResponse.json({ error: 'Assistant message content is required' }, { status: 400 })
    }

    // Maximum payload safety check
    if (userMessage.content.length > 50000 || assistantMessage.content.length > 100000) {
      return NextResponse.json({ error: 'Message payload too large' }, { status: 413 })
    }

    const result = await saveConversationMessages({
      userId: session.user.id,
      conversationId,
      userMessage: {
        id: userMessage.id || `user_${Date.now()}`,
        content: userMessage.content,
        timestamp: userMessage.timestamp || Date.now(),
      },
      assistantMessage: {
        id: assistantMessage.id || `asst_${Date.now()}`,
        content: assistantMessage.content,
        timestamp: assistantMessage.timestamp || Date.now(),
        modelUsed: assistantMessage.modelUsed,
        intent: assistantMessage.intent,
        showGISMap: assistantMessage.showGISMap,
        gisMapType: assistantMessage.gisMapType,
      },
      location,
      language,
      customTitle,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error('[API /api/chat/history POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save chat message' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/chat/history
 * Clears ALL conversations for the authenticated user.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const deletedCount = await clearAllConversations(session.user.id)
    return NextResponse.json({ success: true, deletedCount })
  } catch (error: any) {
    console.error('[API /api/chat/history DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    )
  }
}
