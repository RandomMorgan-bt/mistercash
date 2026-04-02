'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import ReactMarkdown from 'react-markdown'

function ChatsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatIdFromUrl = searchParams?.get('id')
    ? decodeURIComponent(searchParams.get('id'))
    : null
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [accessBlocked, setAccessBlocked] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setProfile(profile)

      if (!profile?.is_gifted) {
        const { data: userSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()
        const hasActiveSub = userSub &&
          (userSub.status === 'active' || userSub.status === 'trialing')
        if (!hasActiveSub) {
          const trialStart = profile?.trial_started_at
            ? new Date(profile.trial_started_at)
            : new Date(profile?.created_at)
          const days = (new Date() - trialStart) / (1000 * 60 * 60 * 24)
          if (days > 14) { setAccessBlocked(true); return }
        }
      }

      if (chatIdFromUrl) {
        const { data: specificChat } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatIdFromUrl)
          .eq('user_id', user.id)
          .single()
        if (specificChat) {
          setChatId(specificChat.id)
          const loaded = JSON.parse(specificChat.messages)
          setMessages(loaded)
          const last = loaded[loaded.length - 1]
          if (last?.role === 'user' && last?.content?.startsWith('[TASK SUBMISSION')) {
            triggerEvaluation(loaded, profile, specificChat.id, user.id)
          }
          return
        }
      }

      const { data: existingChats } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (existingChats && existingChats.length > 0) {
        const chat = existingChats[0]
        setChatId(chat.id)
        const loaded = JSON.parse(chat.messages)
        setMessages(loaded)
        const last = loaded[loaded.length - 1]
        if (last?.role === 'user' && last?.content?.startsWith('[TASK SUBMISSION')) {
          triggerEvaluation(loaded, profile, chat.id, user.id)
        }
      } else {
        const initialMessages = [{
          role: 'assistant',
          content: `What's up. I'm Mister Cash. 💵⌚\n\nYou told me you want to become: **${profile?.goal || 'something great'}**.\n\nLet's get to work. Tell me where you're at right now with this goal — what have you already tried or learned?`,
        }]
        const { data: newChat } = await supabase
          .from('chats')
          .insert({
            user_id: user.id,
            title: 'Chat 1',
            messages: JSON.stringify(initialMessages),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()
        if (newChat) { setChatId(newChat.id); setMessages(initialMessages) }
      }
    }
    getUser()
  }, [chatIdFromUrl])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const updateMemory = async (userId, conversationMessages, assistantResponse) => {
    try {
      await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, messages: conversationMessages, assistantResponse }),
      })
    } catch (e) {
      console.error('Memory update failed:', e)
    }
  }

  const triggerEvaluation = async (currentMessages, currentProfile, currentChatId, userId) => {
    setLoading(true)

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: currentMessages,
        userGoal: currentProfile?.goal,
        experienceLevel: currentProfile?.experience_level,
        learningStyle: currentProfile?.learning_style,
        userId,
      }),
    })

    const data = await response.json()
    const finalMessages = [...currentMessages, { role: 'assistant', content: data.message }]
    setMessages(finalMessages)

    await supabase
      .from('chats')
      .update({ messages: JSON.stringify(finalMessages), updated_at: new Date().toISOString() })
      .eq('id', currentChatId)

    await updateMemory(userId, finalMessages, data.message)

    if (data.deleteMemory && data.updatedMemory !== undefined) {
      await supabase
        .from('memories')
        .update({ content: data.updatedMemory, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
    }

    const approvalKeywords = [
      'great', 'good', 'solid', 'nailed', 'well done', 'approved',
      'complete', 'done', 'nice', 'excellent', 'impressive',
    ]
    const isApproved = approvalKeywords.some(w => data.message.toLowerCase().includes(w))
    if (isApproved) {
      const match = currentMessages[currentMessages.length - 1].content.match(/\[TASK SUBMISSION - (.+?)\]/)
      if (match) {
        await supabase
          .from('tasks')
          .update({ completed: true })
          .eq('chat_id', currentChatId)
          .eq('title', match[1])
      }
    }

    setLoading(false)
  }

  const saveMessages = async (updatedMessages) => {
    if (!chatId) return
    await supabase
      .from('chats')
      .update({ messages: JSON.stringify(updatedMessages), updated_at: new Date().toISOString() })
      .eq('id', chatId)
  }

  const startNewChat = async () => {
    const initialMessages = [{
      role: 'assistant',
      content: `New goal, new grind. 💵⌚\n\nWhat do you want to learn or build this time? Tell me the goal.`,
    }]
    const { data: newChat } = await supabase
      .from('chats')
      .insert({
        user_id: user.id,
        title: 'New Chat',
        messages: JSON.stringify(initialMessages),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (newChat) {
      setChatId(newChat.id)
      setMessages(initialMessages)
      router.push(`/chats?id=${newChat.id}`)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading || accessBlocked) return

    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: updatedMessages,
        userGoal: profile?.goal,
        experienceLevel: profile?.experience_level,
        learningStyle: profile?.learning_style,
        userId: user?.id,
      }),
    })

    const data = await response.json()
    const finalMessages = [...updatedMessages, { role: 'assistant', content: data.message }]

    if (messages.length === 1) {
      await supabase.from('chats').update({ title: input.slice(0, 40) }).eq('id', chatId)
    }

    setMessages(finalMessages)
    await saveMessages(finalMessages)
    await updateMemory(user?.id, finalMessages, data.message)

    if (data.deleteMemory && data.updatedMemory !== undefined) {
      await supabase
        .from('memories')
        .update({ content: data.updatedMemory, updated_at: new Date().toISOString() })
        .eq('user_id', user?.id)
    }

    if (data.tasks && data.tasks.tasks) {
      await supabase.from('tasks').insert(
        data.tasks.tasks.map(task => ({
          user_id: user.id,
          chat_id: chatId,
          box_id: data.tasks.box_id,
          title: task.title,
          description: task.description,
          type: task.type,
          completed: false,
        }))
      )
    }

    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (accessBlocked) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100vh',
        background: '#000', color: '#fff',
        alignItems: 'center', justifyContent: 'center', padding: '32px',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>💵⌚</div>
        <h1 className="text-2xl font-bold text-green-400 tracking-widest mb-4 text-center">
          YOUR TRIAL HAS ENDED
        </h1>
        <p className="text-gray-400 text-center mb-8" style={{ maxWidth: '400px' }}>
          Your progress, tasks and history are all saved. Subscribe to pick up exactly where you left off.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-green-400 text-black font-bold px-8 py-4 tracking-widest hover:bg-green-300 transition-all"
        >
          SEE PLANS →
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#000', color: '#fff' }}>

      {/* Header */}
      <div
        className="border-b border-gray-800"
        style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: '#1f2937', border: '1px solid #374151', borderRadius: '8px',
            color: '#4ade80', cursor: 'pointer', padding: '8px 14px',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 'bold', flexShrink: 0,
          }}
        >
          ← Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '20px' }}>💵⌚</span>
          <span className="font-bold text-green-400 tracking-widest" style={{ fontSize: '13px' }}>
            MISTER CASH
          </span>
        </div>
        <button
          onClick={startNewChat}
          className="text-gray-500 hover:text-green-400 border border-gray-700 hover:border-green-400 transition-all"
          style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '8px', background: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          + New
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: isMobile ? '16px 12px' : '24px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            {msg.role === 'assistant' && (
              <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '4px' }}>💵</span>
            )}
            <div style={{
              maxWidth: isMobile ? '88%' : '75%',
              padding: isMobile ? '10px 14px' : '12px 16px',
              borderRadius: '16px',
              fontSize: '14px',
              lineHeight: '1.6',
              background: msg.role === 'user' ? '#4ade80' : '#111827',
              color: msg.role === 'user' ? '#000' : '#fff',
              border: msg.role === 'assistant' ? '1px solid #1f2937' : 'none',
              fontWeight: msg.role === 'user' ? '500' : 'normal',
            }}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>💵</span>
            <div style={{
              background: '#111827', border: '1px solid #1f2937',
              padding: '12px 16px', borderRadius: '16px',
              fontSize: '14px', color: '#9ca3af',
            }}>
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="border-t border-gray-800"
        style={{ padding: isMobile ? '12px' : '16px 24px', flexShrink: 0 }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Mister Cash..."
            rows={1}
            className="bg-gray-900 border border-gray-700 focus:border-green-400 text-white placeholder-gray-500 outline-none resize-none"
            style={{ flex: 1, borderRadius: '12px', padding: '12px 16px', fontSize: '14px', minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-green-400 text-black font-bold tracking-widest disabled:opacity-40"
            style={{ borderRadius: '12px', padding: '0 20px', height: '44px', fontSize: '12px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            SEND
          </button>
        </div>
        {!isMobile && (
          <p className="text-gray-600 text-xs mt-2">Press Enter to send · Shift+Enter for new line</p>
        )}
      </div>

    </div>
  )
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
      <ChatsContent />
    </Suspense>
  )
}
