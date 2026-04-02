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
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
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

        const hasActiveSubscription = userSub &&
          (userSub.status === 'active' || userSub.status === 'trialing')

        if (!hasActiveSubscription) {
          const trialStart = profile?.trial_started_at
            ? new Date(profile.trial_started_at)
            : new Date(profile?.created_at)
          const daysSinceTrial = (new Date() - trialStart) / (1000 * 60 * 60 * 24)
          if (daysSinceTrial > 14) {
            setAccessBlocked(true)
            return
          }
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
          const loadedMessages = JSON.parse(specificChat.messages)
          setMessages(loadedMessages)
          const lastMessage = loadedMessages[loadedMessages.length - 1]
          if (lastMessage?.role === 'user' && lastMessage?.content?.startsWith('[TASK SUBMISSION')) {
            triggerEvaluation(loadedMessages, profile, specificChat.id, user.id)
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
        const loadedMessages = JSON.parse(chat.messages)
        setMessages(loadedMessages)
        const lastMessage = loadedMessages[loadedMessages.length - 1]
        if (lastMessage?.role === 'user' && lastMessage?.content?.startsWith('[TASK SUBMISSION')) {
          triggerEvaluation(loadedMessages, profile, chat.id, user.id)
        }
      } else {
        const initialMessages = [
          {
            role: 'assistant',
            content: `What's up. I'm Mister Cash. 💵⌚\n\nYou told me you want to become: **${profile?.goal || 'something great'}**.\n\nLet's get to work. Tell me where you're at right now with this goal — what have you already tried or learned?`,
          },
        ]

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

        if (newChat) {
          setChatId(newChat.id)
          setMessages(initialMessages)
        }
      }
    }
    getUser()
  }, [chatIdFromUrl])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea on mobile
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
        body: JSON.stringify({
          userId,
          messages: conversationMessages,
          assistantResponse,
        }),
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
      .update({
        messages: JSON.stringify(finalMessages),
        updated_at: new Date().toISOString(),
      })
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
    const responseText = data.message.toLowerCase()
    const isApproved = approvalKeywords.some(word => responseText.includes(word))

    if (isApproved) {
      const submissionMessage = currentMessages[currentMessages.length - 1].content
      const taskTitleMatch = submissionMessage.match(/\[TASK SUBMISSION - (.+?)\]/)
      if (taskTitleMatch) {
        const taskTitle = taskTitleMatch[1]
        await supabase
          .from('tasks')
          .update({ completed: true })
          .eq('chat_id', currentChatId)
          .eq('title', taskTitle)
      }
    }

    setLoading(false)
  }

  const saveMessages = async (updatedMessages) => {
    if (!chatId) return
    await supabase
      .from('chats')
      .update({
        messages: JSON.stringify(updatedMessages),
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId)
  }

  const startNewChat = async () => {
    const initialMessages = [
      {
        role: 'assistant',
        content: `New goal, new grind. 💵⌚\n\nWhat do you want to learn or build this time? Tell me the goal.`,
      },
    ]

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
      const title = input.slice(0, 40)
      await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId)
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
      const taskRows = data.tasks.tasks.map(task => ({
        user_id: user.id,
        chat_id: chatId,
        box_id: data.tasks.box_id,
        title: task.title,
        description: task.description,
        type: task.type,
        completed: false,
      }))
      await supabase.from('tasks').insert(taskRows)
    }

    setLoading(false)
  }

  const handleKeyDown = (e) => {
    // On mobile, Enter adds newline. On desktop, Enter sends.
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth >= 768) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (accessBlocked) {
    return (
      <div className="flex flex-col h-screen bg-black text-white items-center justify-center p-8">
        <div className="text-6xl mb-6">💵⌚</div>
        <h1 className="text-2xl font-bold text-green-400 tracking-widest mb-4 text-center">
          YOUR TRIAL HAS ENDED
        </h1>
        <p className="text-gray-400 text-center mb-8 max-w-md">
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
    <div className="flex flex-col h-screen bg-black text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-500 hover:text-green-400 transition-all text-lg p-1 -ml-1"
        >
          ←
        </button>
        <span className="text-xl md:text-2xl">💵⌚</span>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-green-400 tracking-widest text-xs md:text-sm">MISTER CASH</h1>
          <p className="text-gray-500 text-xs hidden sm:block">Your AI mentor</p>
        </div>
        <button
          onClick={startNewChat}
          className="text-xs text-gray-500 hover:text-green-400 border border-gray-700 hover:border-green-400 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
        >
          + New
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <span className="text-lg md:text-xl mr-2 mt-1 flex-shrink-0">💵</span>
            )}
            <div className={`max-w-[85%] md:max-w-[75%] px-3 md:px-4 py-2.5 md:py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
              msg.role === 'user'
                ? 'bg-green-400 text-black font-medium'
                : 'bg-gray-900 text-white border border-gray-800'
            }`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <span className="text-lg md:text-xl mr-2 flex-shrink-0">💵</span>
            <div className="bg-gray-900 border border-gray-800 px-3 md:px-4 py-2.5 md:py-3 rounded-2xl text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-3 md:px-6 py-3 md:py-4 flex-shrink-0">
        <div className="flex gap-2 md:gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Mister Cash..."
            rows={1}
            className="flex-1 bg-gray-900 border border-gray-700 focus:border-green-400 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm text-white placeholder-gray-500 resize-none outline-none"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-green-400 text-black font-bold tracking-widest text-xs px-4 md:px-5 rounded-xl disabled:opacity-40 flex-shrink-0"
            style={{ height: '44px' }}
          >
            SEND
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-1.5 hidden md:block">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

    </div>
  )
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ChatsContent />
    </Suspense>
  )
}
