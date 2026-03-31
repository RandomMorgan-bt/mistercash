'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ChatsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState(null)
  const bottomRef = useRef(null)

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

      // Load most recent chat or create new one
      const { data: existingChats } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (existingChats && existingChats.length > 0) {
        const chat = existingChats[0]
        setChatId(chat.id)
        setMessages(JSON.parse(chat.messages))
      } else {
        // Create new chat
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
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  const sendMessage = async () => {
    if (!input.trim() || loading) return

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
      }),
    })

    const data = await response.json()
    const finalMessages = [...updatedMessages, { role: 'assistant', content: data.message }]
    setMessages(finalMessages)
    await saveMessages(finalMessages)
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-500 hover:text-green-400 mr-2 text-lg"
        >
          ←
        </button>
        <span className="text-2xl">💵⌚</span>
        <div>
          <h1 className="font-bold text-green-400 tracking-widest text-sm">MISTER CASH</h1>
          <p className="text-gray-500 text-xs">Your AI mentor</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <span className="text-xl mr-3 mt-1">💵</span>
            )}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
              msg.role === 'user'
                ? 'bg-green-400 text-black font-medium'
                : 'bg-gray-900 text-white border border-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <span className="text-xl mr-3">💵</span>
            <div className="bg-gray-900 border border-gray-800 px-4 py-3 rounded-2xl text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-6 py-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Mister Cash..."
            rows={1}
            className="flex-1 bg-gray-900 border border-gray-700 focus:border-green-400 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-green-400 text-black font-bold tracking-widest text-xs px-5 rounded-xl disabled:opacity-40"
          >
            SEND
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-2">Press Enter to send</p>
      </div>

    </div>
  )
}
