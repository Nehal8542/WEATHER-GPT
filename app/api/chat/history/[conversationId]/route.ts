import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getConversation,
  deleteConversation,
  renameConversation,
} from '@/lib/chat-history'

export const maxDuration = 15

interface RouteContext {
  params: Promise<{ conversationId: string }>
}

/**
 * GET /api/chat/history/[conversationId]
 * Retrieves the full conversation history for the authenticated user.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const { conversationId } = await context.params
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    const conversation = await getConversation(session.user.id, conversationId)
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ conversation })
  } catch (error: any) {
    console.error('[API /api/chat/history/[id] GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve conversation' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/chat/history/[conversationId]
 * Deletes a single conversation belonging to the authenticated user.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const { conversationId } = await context.params
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    const deleted = await deleteConversation(session.user.id, conversationId)
    if (!deleted) {
      return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ success: true, conversationId })
  } catch (error: any) {
    console.error('[API /api/chat/history/[id] DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/chat/history/[conversationId]
 * Renames a conversation title for the authenticated user.
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const { conversationId } = await context.params
    const body = await req.json()
    const { title } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Valid title is required' }, { status: 400 })
    }

    const updated = await renameConversation(session.user.id, conversationId, title.trim())
    if (!updated) {
      return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ success: true, title: title.trim() })
  } catch (error: any) {
    console.error('[API /api/chat/history/[id] PATCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to rename conversation' },
      { status: 500 }
    )
  }
}
