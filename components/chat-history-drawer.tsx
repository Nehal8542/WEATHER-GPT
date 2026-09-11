'use client'

import React, { useState, useMemo } from 'react'
import {
  Clock,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { ChatConversationSummary } from '@/lib/chat-history'

interface ChatHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  conversations: ChatConversationSummary[]
  activeConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onNewChat: () => void
  onDeleteConversation: (conversationId: string) => Promise<void>
  onClearAllHistory: () => Promise<void>
  onRenameConversation: (conversationId: string, newTitle: string) => Promise<void>
  isLoading: boolean
  lang?: string
}

export function ChatHistoryDrawer({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAllHistory,
  onRenameConversation,
  isLoading,
  lang = 'hi',
}: ChatHistoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Filter conversations based on search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase().trim()
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        c.lastMessageSnippet.toLowerCase().includes(q)
    )
  }, [conversations, searchQuery])

  // Group conversations by relative time
  const groups = useMemo(() => {
    const today: ChatConversationSummary[] = []
    const yesterday: ChatConversationSummary[] = []
    const thisWeek: ChatConversationSummary[] = []
    const older: ChatConversationSummary[] = []

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
    const startOfWeek = startOfToday - 7 * 24 * 60 * 60 * 1000

    filtered.forEach((conv) => {
      const time = new Date(conv.updatedAt).getTime()
      if (time >= startOfToday) {
        today.push(conv)
      } else if (time >= startOfYesterday) {
        yesterday.push(conv)
      } else if (time >= startOfWeek) {
        thisWeek.push(conv)
      } else {
        older.push(conv)
      }
    })

    return [
      { label: lang === 'hi' ? 'आज (Today)' : 'Today', items: today },
      { label: lang === 'hi' ? 'कल (Yesterday)' : 'Yesterday', items: yesterday },
      { label: lang === 'hi' ? 'पिछले 7 दिन (Past Week)' : 'Past Week', items: thisWeek },
      { label: lang === 'hi' ? 'पुराने (Older)' : 'Older', items: older },
    ].filter((g) => g.items.length > 0)
  }, [filtered, lang])

  // Format relative timestamp
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      const diffMinutes = Math.floor((Date.now() - d.getTime()) / (1000 * 60))
      if (diffMinutes < 1) return lang === 'hi' ? 'अभी' : 'Just now'
      if (diffMinutes < 60) return `${diffMinutes}m`
      const diffHours = Math.floor(diffMinutes / 60)
      if (diffHours < 24) return `${diffHours}h`
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  const handleStartRename = (e: React.MouseEvent, conv: ChatConversationSummary) => {
    e.stopPropagation()
    setEditingId(conv.conversationId)
    setEditingTitle(conv.title)
  }

  const handleSaveRename = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    if (!editingTitle.trim()) return
    await onRenameConversation(conversationId, editingTitle.trim())
    setEditingId(null)
  }

  const handleConfirmDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    setIsDeleting(true)
    try {
      await onDeleteConversation(conversationId)
      setDeletingId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmClearAll = async () => {
    setIsClearing(true)
    try {
      await onClearAllHistory()
      setShowClearConfirm(false)
    } finally {
      setIsClearing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        justifyContent: 'flex-start',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          height: '100%',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '4px 0 24px rgba(15, 47, 90, 0.18)',
          borderRight: '1px solid #bfdbfe',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 61,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#eff6ff',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f2f5a' }}>
                {lang === 'hi' ? 'बातचीत इतिहास' : 'Chat History'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {conversations.length}{' '}
                {conversations.length === 1 ? 'conversation' : 'conversations'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Bar: New Chat & Search */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              onNewChat()
              onClose()
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={16} />
            <span>{lang === 'hi' ? 'नई बातचीत (New Chat)' : 'New Chat'}</span>
          </button>

          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              padding: '0 10px',
            }}
          >
            <Search size={14} style={{ color: '#94a3b8', marginRight: 6 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'hi' ? 'खोजें (Search history)...' : 'Search history...'}
              style={{
                width: '100%',
                padding: '8px 0',
                border: 'none',
                background: 'transparent',
                fontSize: 12,
                color: '#1e293b',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 2,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  style={{
                    height: 64,
                    borderRadius: 12,
                    background: '#e2e8f0',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 20px',
                color: '#64748b',
              }}
            >
              <MessageSquare size={36} style={{ color: '#93c5fd', marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                {searchQuery ? 'No matching chats' : (lang === 'hi' ? 'कोई बातचीत नहीं मिली' : 'No chats yet')}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 240 }}>
                {searchQuery
                  ? 'Try a different search term.'
                  : (lang === 'hi'
                    ? 'मौसम या खेती से जुड़ा सवाल पूछें, आपकी बातचीत यहाँ सुरक्षित रहेगी।'
                    : 'Ask any weather query. Your conversation history will be saved here.')}
              </div>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    padding: '4px 8px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {group.label}
                </div>

                {group.items.map((conv) => {
                  const isActive = conv.conversationId === activeConversationId
                  const isEditing = editingId === conv.conversationId

                  return (
                    <div
                      key={conv.conversationId}
                      onClick={() => {
                        onSelectConversation(conv.conversationId)
                        onClose()
                      }}
                      style={{
                        position: 'relative',
                        padding: '10px 12px',
                        borderRadius: 12,
                        cursor: 'pointer',
                        border: isActive ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                        background: isActive ? '#eff6ff' : '#ffffff',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      {/* Top Row: Title & Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                        }}
                      >
                        {isEditing ? (
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              autoFocus
                              style={{
                                flex: 1,
                                padding: '3px 6px',
                                fontSize: 12,
                                border: '1px solid #3b82f6',
                                borderRadius: 6,
                                outline: 'none',
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => handleSaveRename(e, conv.conversationId)}
                              style={{
                                border: 'none',
                                background: '#2563eb',
                                color: '#fff',
                                borderRadius: 6,
                                padding: '4px 6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Check size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingId(null)
                              }}
                              style={{
                                border: 'none',
                                background: '#e2e8f0',
                                color: '#475569',
                                borderRadius: 6,
                                padding: '4px 6px',
                                cursor: 'pointer',
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: isActive ? 700 : 600,
                                color: isActive ? '#1d4ed8' : '#0f2f5a',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                              }}
                            >
                              {conv.title}
                            </div>

                            {/* Action Buttons */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                flexShrink: 0,
                              }}
                            >
                              <button
                                type="button"
                                title="Rename"
                                onClick={(e) => handleStartRename(e, conv)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#94a3b8',
                                  padding: 4,
                                  cursor: 'pointer',
                                  borderRadius: 4,
                                }}
                                onMouseEnter={(e) => {
                                  ;(e.target as HTMLElement).style.color = '#2563eb'
                                }}
                                onMouseLeave={(e) => {
                                  ;(e.target as HTMLElement).style.color = '#94a3b8'
                                }}
                              >
                                <Edit2 size={12} />
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeletingId(conv.conversationId)
                                }}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#94a3b8',
                                  padding: 4,
                                  cursor: 'pointer',
                                  borderRadius: 4,
                                }}
                                onMouseEnter={(e) => {
                                  ;(e.target as HTMLElement).style.color = '#dc2626'
                                }}
                                onMouseLeave={(e) => {
                                  ;(e.target as HTMLElement).style.color = '#94a3b8'
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Snippet */}
                      <div
                        style={{
                          fontSize: 11,
                          color: '#64748b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.4,
                        }}
                      >
                        {conv.lastMessageSnippet}
                      </div>

                      {/* Badges: Time, Location, Count */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 4,
                          fontSize: 10,
                          color: '#94a3b8',
                        }}
                      >
                        <span>{formatTime(conv.updatedAt)}</span>
                        <span>•</span>
                        <span>
                          {conv.messageCount}{' '}
                          {conv.messageCount === 1 ? 'msg' : 'msgs'}
                        </span>
                        {conv.location && (
                          <>
                            <span>•</span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 2,
                                background: '#dbeafe',
                                color: '#1e40af',
                                padding: '1px 6px',
                                borderRadius: 10,
                                fontWeight: 500,
                              }}
                            >
                              <MapPin size={9} />
                              {conv.location}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Inline Delete Confirmation Popover */}
                      {deletingId === conv.conversationId && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            marginTop: 6,
                            padding: '8px 10px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                            animation: 'fadeIn 0.15s ease',
                          }}
                        >
                          <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>
                            {lang === 'hi' ? 'हटाएं?' : 'Delete chat?'}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={(e) => handleConfirmDelete(e, conv.conversationId)}
                              style={{
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: 'none',
                                background: '#dc2626',
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {isDeleting ? '...' : (lang === 'hi' ? 'हाँ' : 'Yes')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeletingId(null)
                              }}
                              style={{
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                background: '#fff',
                                color: '#475569',
                                fontSize: 11,
                                cursor: 'pointer',
                              }}
                            >
                              {lang === 'hi' ? 'रद्द' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Bottom Danger Zone: Clear all */}
        {conversations.length > 0 && (
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
            }}
          >
            {showClearConfirm ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  background: '#fef2f2',
                  padding: 10,
                  borderRadius: 10,
                  border: '1px solid #fecaca',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>
                  {lang === 'hi'
                    ? 'क्या आप सारा चैट इतिहास हटाना चाहते हैं?'
                    : 'Clear all chat history permanently?'}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'hi' ? 'नहीं' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={isClearing}
                    onClick={handleConfirmClearAll}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#dc2626',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isClearing ? 'Clearing...' : (lang === 'hi' ? 'हाँ, सब हटाएं' : 'Clear All')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px dashed #fca5a5',
                  background: '#fff5f5',
                  color: '#dc2626',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <Trash2 size={13} />
                <span>{lang === 'hi' ? 'सारा इतिहास साफ़ करें' : 'Clear All History'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
