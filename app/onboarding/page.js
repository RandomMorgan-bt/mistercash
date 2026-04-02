'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [learningStyle, setLearningStyle] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/auth')
      else setUser(user)
    }
    getUser()
  }, [])

  async function finishOnboarding() {
    setLoading(true)
    await supabase.from('profiles').upsert(
      {
        user_id: user.id,
        display_name: user.user_metadata?.display_name || null,
        onboarding_completed: true,
        trial_started_at: new Date().toISOString(),
        goal,
        experience_level: experienceLevel || null,
        learning_style: learningStyle.length > 0 ? learningStyle.join(', ') : null,
      },
      { onConflict: 'user_id' }
    )
    router.push('/dashboard')
  }

  const steps = [

    // Step 0 - Introduction
    <div key={0} className="text-center">
      <div className="text-8xl mb-6 animate-bounce">💵</div>
      <h2 className="text-3xl font-bold text-white tracking-widest mb-4">
        Hey, I'm <span className="text-green-400">Mister Cash</span>
      </h2>
      <p className="text-gray-400 mb-4 leading-relaxed max-w-md mx-auto">
        Forget everything school taught you about learning. No tests, no grades, no useless memorization.
      </p>
      <p className="text-gray-400 mb-8 leading-relaxed max-w-md mx-auto">
        I'm going to help you build real skills for the real world. Ready?
      </p>
      <button
        onClick={() => setStep(1)}
        className="bg-green-400 text-black font-bold px-8 py-4 tracking-widest hover:bg-green-300 transition-all"
      >
        LET'S GO →
      </button>
    </div>,

    // Step 1 - Goal (mandatory)
    <div key={1} className="text-center max-w-lg mx-auto">
      <div className="text-5xl mb-4">🎯</div>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6 text-left">
        <p className="text-green-400 font-bold text-sm tracking-widest mb-1">MISTER CASH</p>
        <p className="text-white leading-relaxed">
          First things first — what do you want to become? Tell me your goal. It can be a job, a career, a skill — anything real.
        </p>
      </div>
      <input
        type="text"
        placeholder="e.g. Game Developer, Entrepreneur, Music Producer..."
        value={goal}
        onChange={e => setGoal(e.target.value)}
        className="w-full bg-gray-900 text-white border border-gray-700 px-4 py-3 mb-2 outline-none focus:border-green-400 transition-all text-center"
        maxLength={100}
      />
      <p className="text-gray-600 text-xs mb-6">This is required — I need this to build your learning path.</p>
      <button
        onClick={() => { if (goal.trim()) setStep(2) }}
        disabled={!goal.trim()}
        className="bg-green-400 text-black font-bold px-8 py-4 tracking-widest hover:bg-green-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        NEXT →
      </button>
    </div>,

    // Step 2 - Experience Level (skippable)
    <div key={2} className="text-center max-w-lg mx-auto">
      <div className="text-5xl mb-4">📊</div>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6 text-left">
        <p className="text-green-400 font-bold text-sm tracking-widest mb-1">MISTER CASH</p>
        <p className="text-white leading-relaxed">
          Where are you right now with <span className="text-green-400">{goal}</span>? Be honest — I'm not judging, I'm calibrating.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {[
          'Complete beginner — never done this',
          'I know the basics',
          'Intermediate — some experience',
          'Advanced — I know a lot already',
        ].map(level => (
          <button
            key={level}
            onClick={() => setExperienceLevel(level)}
            className={`px-4 py-3 border text-sm tracking-wide transition-all text-left ${
              experienceLevel === level
                ? 'border-green-400 bg-green-400 text-black font-bold'
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => { setExperienceLevel(''); setStep(3) }}
          className="border border-gray-700 text-gray-500 px-6 py-3 text-sm tracking-widest hover:border-gray-500 transition-all"
        >
          DON'T ANSWER
        </button>
        <button
          onClick={() => { if (experienceLevel) setStep(3) }}
          disabled={!experienceLevel}
          className="bg-green-400 text-black font-bold px-8 py-3 tracking-widest hover:bg-green-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          NEXT →
        </button>
      </div>
    </div>,

    // Step 3 - Learning Style (skippable, multi-select)
    <div key={3} className="text-center max-w-lg mx-auto">
      <div className="text-5xl mb-4">🧠</div>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6 text-left">
        <p className="text-green-400 font-bold text-sm tracking-widest mb-1">MISTER CASH</p>
        <p className="text-white leading-relaxed">
          Last one — how do you learn best? Select as many as apply. This helps me assign you the right kind of tasks.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {[
          'Watching videos',
          'Reading books and articles',
          'Doing practical exercises',
          'Listening to podcasts',
          'A mix of everything',
        ].map(style => (
          <button
            key={style}
            onClick={() =>
              setLearningStyle(prev =>
                prev.includes(style)
                  ? prev.filter(s => s !== style)
                  : [...prev, style]
              )
            }
            className={`px-4 py-3 border text-sm tracking-wide transition-all text-left ${
              learningStyle.includes(style)
                ? 'border-green-400 bg-green-400 text-black font-bold'
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            {learningStyle.includes(style) ? '✓ ' : ''}{style}
          </button>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => { setLearningStyle([]); finishOnboarding() }}
          className="border border-gray-700 text-gray-500 px-6 py-3 text-sm tracking-widest hover:border-gray-500 transition-all"
        >
          DON'T ANSWER
        </button>
        <button
          onClick={() => { if (learningStyle.length > 0) finishOnboarding() }}
          disabled={learningStyle.length === 0 || loading}
          className="bg-green-400 text-black font-bold px-8 py-3 tracking-widest hover:bg-green-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'LOADING...' : 'FINISH →'}
        </button>
      </div>
    </div>,

  ]

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">

        {step > 0 && (
          <div className="flex justify-center gap-2 mb-12">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  step >= i ? 'bg-green-400' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        )}

        {steps[step]}

      </div>
    </main>
  )
}
