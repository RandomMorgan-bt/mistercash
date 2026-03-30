'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Logged in successfully!')
    } else {
      if (!displayName.trim()) {
        setMessage('Please enter your name.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            phone: phone || null,
          },
        },
      })

      if (error) setMessage(error.message)
      else setMessage('Account created! Check your email to confirm.')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md p-8 border border-gray-800">

        <h1 className="text-3xl font-bold text-white tracking-widest mb-2 text-center">
          MISTER <span className="text-green-400">CASH</span>
        </h1>

        <p className="text-gray-500 text-center text-sm mb-8 tracking-wide">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </p>

        {!isLogin && (
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-700 px-4 py-3 mb-4 outline-none focus:border-green-400 transition-all"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-900 text-white border border-gray-700 px-4 py-3 mb-4 outline-none focus:border-green-400 transition-all"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-gray-900 text-white border border-gray-700 px-4 py-3 mb-4 outline-none focus:border-green-400 transition-all"
        />

        {!isLogin && (
          <input
            type="tel"
            placeholder="Phone Number (optional)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-700 px-4 py-3 mb-4 outline-none focus:border-green-400 transition-all"
          />
        )}

        {message && (
          <p className="text-green-400 text-sm mb-4 text-center">{message}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-400 text-black font-bold py-3 tracking-widest hover:bg-green-300 transition-all disabled:opacity-50"
        >
          {loading ? 'LOADING...' : isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
        </button>

        <p className="text-gray-500 text-center text-sm mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-400 cursor-pointer hover:underline"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </span>
        </p>

      </div>
    </main>
  )
}
