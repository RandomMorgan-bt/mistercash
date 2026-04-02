'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import MisterCash from '../components/MisterCash'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [activeSection, setActiveSection] = useState('chats')
  const [chats, setChats] = useState([])
  const [tasks, setTasks] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [subscribing, setSubscribing] = useState(false)
  const [accessBlocked, setAccessBlocked] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sidebarRef = useRef(null)
  const router = useRouter()

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

      if (!profile || !profile.onboarding_completed) { router.push('/onboarding'); return }

      const { data: userSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setSubscription(userSub)

      if (!profile.is_gifted) {
        const hasActiveSub = userSub && (userSub.status === 'active' || userSub.status === 'trialing')
        if (!hasActiveSub) {
          const trialStart = profile.trial_started_at
            ? new Date(profile.trial_started_at)
            : new Date(profile.created_at)
          const days = (new Date() - trialStart) / (1000 * 60 * 60 * 24)
          if (days > 14) { setAccessBlocked(true); setActiveSection('subscription') }
        }
      }

      const { data: userChats } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      setChats(userChats || [])

      const { data: userTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      setTasks((userTasks || []).map(t => ({ ...t, showSubmit: false })))
    }
    getUser()
  }, [])

  useEffect(() => {
    const handle = (e) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [sidebarOpen])

  useEffect(() => {
    document.body.style.overflow = (sidebarOpen && isMobile) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen, isMobile])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  async function handleSubscribe(priceId) {
    if (!user) return
    setSubscribing(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id, userEmail: user.email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    }
    setSubscribing(false)
  }

  const navItems = [
    { id: 'chats',        label: 'Chats',          icon: '💬' },
    { id: 'tasks',        label: 'Tasks',           icon: '✅' },
    { id: 'progress',     label: 'Progress',        icon: '📈' },
    { id: 'certificates', label: 'Certificates',    icon: '🏆' },
    { id: 'portfolio',    label: 'Portfolio',       icon: '📁' },
    { id: 'career',       label: 'Career Roadmap',  icon: '🚀' },
    { id: 'profile',      label: 'Profile',         icon: '👤' },
    { id: 'subscription', label: 'Subscription',    icon: '💳' },
    { id: 'settings',     label: 'Settings',        icon: '⚙️' },
    { id: 'help',         label: 'Help',            icon: '❓' },
  ]

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '€9.99',
      period: 'per month',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
      savings: null,
      highlight: false,
    },
    {
      id: 'quarterly',
      name: 'Every 3 Months',
      price: '€24.99',
      period: 'every 3 months',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY,
      savings: 'Save 17%',
      highlight: false,
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '€79.99',
      period: 'per year',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY,
      savings: 'Save 33% — Best Deal',
      highlight: true,
    },
  ]

  const handleNavClick = (itemId) => {
    if (accessBlocked && itemId !== 'subscription') return
    if (itemId === 'chats') {
      if (accessBlocked) return
      router.push('/chats')
    } else {
      setActiveSection(itemId)
    }
    setSidebarOpen(false)
  }

  const sidebarStyle = isMobile
    ? {
        position: 'fixed', top: 0, left: 0, height: '100%', width: '280px',
        zIndex: 50, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }
    : {
        position: 'relative', width: '256px', flexShrink: 0,
      }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex' }}>

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }}
        />
      )}

      {/* SIDEBAR */}
      <aside
        ref={sidebarRef}
        style={sidebarStyle}
        className="bg-gray-950 border-r border-gray-800 flex flex-col"
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white tracking-widest">
            MISTER <span className="text-green-400">CASH</span>
          </h1>
        </div>

        <div className="flex flex-col items-center py-6 border-b border-gray-800">
          <div className="flex items-center justify-center">
            <MisterCash expression="neutral" size={100} />
          </div>
          <div
            className="mt-3 bg-gray-800 text-green-400 text-xs px-3 py-2 rounded-lg text-center border border-gray-700"
            style={{ maxWidth: '200px' }}
          >
            {accessBlocked
              ? 'Your trial has ended. Subscribe to continue.'
              : 'Ready to learn something real today?'}
          </div>
        </div>

        <nav style={{ flex: 1, paddingTop: '16px', paddingBottom: '16px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm text-left transition-all ${
                activeSection === item.id
                  ? 'bg-green-400 text-black font-bold'
                  : accessBlocked && item.id !== 'subscription'
                    ? 'text-gray-700 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              <span className="tracking-wide">{item.label}</span>
              {accessBlocked && item.id !== 'subscription' && (
                <span className="ml-auto text-gray-700 text-xs">🔒</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-gray-500 text-xs mb-2 truncate">
            {user?.user_metadata?.display_name || user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-gray-500 hover:text-red-400 transition-all text-left tracking-wide"
          >
            → Log out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <div className="border-b border-gray-800 px-4 py-4 flex items-center gap-3">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9ca3af', flexShrink: 0 }}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect y="4" width="24" height="2" rx="1" fill="currentColor" />
                <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
                <rect y="18" width="24" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
          )}
          <h2 className="text-white font-bold tracking-widest text-lg uppercase" style={{ flex: 1 }}>
            {navItems.find(i => i.id === activeSection)?.label}
          </h2>
          {!isMobile && (
            <p className="text-gray-500 text-sm">
              Welcome back,{' '}
              <span className="text-green-400">{user?.user_metadata?.display_name || 'user'}</span>
            </p>
          )}
        </div>

        {accessBlocked && activeSection !== 'subscription' && (
          <div
            className="bg-gray-950 border-b border-green-400 px-4 py-4"
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <p className="text-green-400 text-sm font-bold tracking-wide">
              Your 14-day free trial has ended.
            </p>
            <button
              onClick={() => setActiveSection('subscription')}
              className="bg-green-400 text-black font-bold text-xs px-4 py-2 tracking-widest hover:bg-green-300 transition-all"
            >
              SUBSCRIBE TO CONTINUE
            </button>
          </div>
        )}

        <div style={{ flex: 1, padding: isMobile ? '16px' : '32px', overflowY: 'auto' }}>

          {/* CHATS */}
          {activeSection === 'chats' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your conversations with Mister Cash</p>
              {chats.length === 0 ? (
                <div className="border border-gray-800 p-8 text-center">
                  <p className="text-gray-600 text-sm">No chats yet. Start your first session with Mister Cash.</p>
                  <button
                    onClick={() => router.push('/chats')}
                    className="mt-4 bg-green-400 text-black font-bold px-6 py-3 text-sm tracking-widest hover:bg-green-300 transition-all"
                  >
                    START LEARNING
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {chats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => router.push(`/chats?id=${chat.id}`)}
                      className="border border-gray-800 p-4 cursor-pointer hover:border-green-400 transition-all"
                    >
                      <p className="text-white text-sm font-bold">{chat.title}</p>
                      <p className="text-gray-500 text-xs mt-1">{new Date(chat.updated_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                  <button
                    onClick={() => router.push('/chats')}
                    className="mt-4 bg-green-400 text-black font-bold px-6 py-3 text-sm tracking-widest hover:bg-green-300 transition-all w-full"
                  >
                    CONTINUE LEARNING
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TASKS */}
          {activeSection === 'tasks' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your active task boxes</p>
              {tasks.length === 0 ? (
                <div className="border border-gray-800 p-8 text-center">
                  <p className="text-gray-600 text-sm">No tasks yet. Tasks will appear here once Mister Cash assigns them.</p>
                  <button
                    onClick={() => router.push('/chats')}
                    className="mt-4 bg-green-400 text-black font-bold px-6 py-3 text-sm tracking-widest hover:bg-green-300 transition-all"
                  >
                    START LEARNING
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className={`border p-4 transition-all ${
                        task.completed ? 'border-gray-800 opacity-50' : 'border-gray-700 hover:border-green-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">

                        {task.type === 'knowledge' ? (
                          <button
                            onClick={async () => {
                              await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id)
                              setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
                            }}
                            className={`mt-1 w-5 h-5 border flex-shrink-0 flex items-center justify-center transition-all ${
                              task.completed
                                ? 'bg-green-400 border-green-400 text-black'
                                : 'border-gray-600 hover:border-green-400'
                            }`}
                          >
                            {task.completed && '✓'}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setTasks(tasks.map(t => t.id === task.id ? { ...t, showSubmit: !t.showSubmit } : t))
                            }
                            className="mt-1 text-xs bg-green-400 text-black font-bold px-3 py-1 flex-shrink-0 hover:bg-green-300 transition-all"
                          >
                            SUBMIT
                          </button>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <p className={`text-sm font-bold ${task.completed ? 'line-through text-gray-600' : 'text-white'}`}>
                              {task.title}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                              task.type === 'knowledge' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                            }`}>
                              {task.type}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs">{task.description}</p>

                          {task.type === 'practice' && task.showSubmit && (
                            <div className="mt-3 border-t border-gray-800 pt-3">
                              <p className="text-gray-400 text-xs mb-2">
                                Paste a link, describe what you built, or explain what you did.
                              </p>
                              <textarea
                                id={`submit-${task.id}`}
                                placeholder="Describe what you did or paste a link..."
                                className="w-full bg-gray-900 border border-gray-700 focus:border-green-400 text-white text-xs px-3 py-2 outline-none resize-none rounded"
                                rows={3}
                              />
                              <button
                                onClick={async (e) => {
                                  e.target.disabled = true
                                  e.target.textContent = 'SENDING...'
                                  const submission = document.getElementById(`submit-${task.id}`).value
                                  if (!submission.trim()) return
                                  const chatData = await supabase
                                    .from('chats')
                                    .select('messages')
                                    .eq('id', task.chat_id)
                                    .single()
                                  const existing = JSON.parse(chatData.data.messages || '[]')
                                  await supabase
                                    .from('chats')
                                    .update({
                                      messages: JSON.stringify([
                                        ...existing,
                                        { role: 'user', content: `[TASK SUBMISSION - ${task.title}]\n\n${submission}` },
                                      ]),
                                      updated_at: new Date().toISOString(),
                                    })
                                    .eq('id', task.chat_id)
                                  router.push(`/chats?id=${task.chat_id}`)
                                }}
                                className="mt-2 bg-green-400 text-black font-bold text-xs px-4 py-2 tracking-widest hover:bg-green-300 transition-all"
                              >
                                SEND TO MISTER CASH →
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={async () => {
                            await supabase.from('tasks').delete().eq('id', task.id)
                            setTasks(tasks.filter(t => t.id !== task.id))
                          }}
                          className="text-gray-700 hover:text-red-400 text-xs transition-all flex-shrink-0"
                        >
                          reject
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROGRESS */}
          {activeSection === 'progress' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your skill levels and learning journey</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-gray-600 text-sm">No progress tracked yet. Start learning to see your growth.</p>
              </div>
            </div>
          )}

          {/* CERTIFICATES */}
          {activeSection === 'certificates' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your Mister Cash certifications</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-gray-600 text-sm">No certificates earned yet. Keep learning to earn your first one.</p>
              </div>
            </div>
          )}

          {/* PORTFOLIO */}
          {activeSection === 'portfolio' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Projects you have built and submitted</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-gray-600 text-sm">No projects yet. Submit your first project to build your portfolio.</p>
              </div>
            </div>
          )}

          {/* CAREER */}
          {activeSection === 'career' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your personalised roadmap to your first opportunity</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-gray-600 text-sm">Your career roadmap will unlock once you reach the right level.</p>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeSection === 'profile' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your personal information</p>
              <div className="border border-gray-800 p-6">
                <div className="mb-4">
                  <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Display Name</p>
                  <p className="text-white">{user?.user_metadata?.display_name || '—'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Email</p>
                  <p className="text-white">{user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs tracking-widest uppercase mb-1">Phone</p>
                  <p className="text-white">{user?.user_metadata?.phone || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* SUBSCRIPTION */}
          {activeSection === 'subscription' && (
            <div>
              <p className="text-gray-500 text-sm mb-2 tracking-wide">Manage your plan</p>

              {accessBlocked && (
                <div className="border border-green-400 p-6 mb-8 bg-gray-950">
                  <p className="text-green-400 font-bold tracking-widest mb-1">YOUR FREE TRIAL HAS ENDED</p>
                  <p className="text-gray-400 text-sm">Your progress, tasks and history are all saved. Subscribe to pick up where you left off.</p>
                </div>
              )}

              {!accessBlocked && subscription?.status === 'active' ? (
                <div className="border border-green-400 p-6 mb-8">
                  <p className="text-green-400 font-bold tracking-widest mb-1">ACTIVE SUBSCRIPTION</p>
                  <p className="text-gray-400 text-sm">
                    Your plan renews on {new Date(subscription.current_period_end).toLocaleDateString()}.
                  </p>
                </div>
              ) : !accessBlocked && (
                <div className="border border-gray-800 p-6 mb-8">
                  <p className="text-green-400 font-bold tracking-widest mb-1">14-DAY FREE TRIAL ACTIVE</p>
                  <p className="text-gray-400 text-sm">Full access. No credit card required until trial ends.</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    className={`border p-5 transition-all ${
                      plan.highlight ? 'border-green-400 bg-gray-950' : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}>
                      <div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                          <p className="text-white font-bold tracking-wide">{plan.name}</p>
                          {plan.savings && (
                            <span className={`text-xs px-2 py-0.5 font-bold tracking-wide ${
                              plan.highlight ? 'bg-green-400 text-black' : 'bg-gray-800 text-green-400'
                            }`}>
                              {plan.savings}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs">{plan.period}</p>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        width: isMobile ? '100%' : 'auto',
                      }}>
                        <p className="text-white font-bold text-xl">{plan.price}</p>
                        <button
                          onClick={() => handleSubscribe(plan.priceId)}
                          disabled={subscribing || subscription?.status === 'active'}
                          className={`font-bold text-xs px-5 py-3 tracking-widest transition-all disabled:opacity-40 ${
                            plan.highlight
                              ? 'bg-green-400 text-black hover:bg-green-300'
                              : 'border border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
                          }`}
                        >
                          {subscribing ? 'LOADING...' : subscription?.status === 'active' ? 'CURRENT' : 'GET STARTED'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeSection === 'settings' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Account settings</p>
              <div className="border border-gray-800 p-6">
                <p className="text-gray-600 text-sm">Settings coming soon.</p>
              </div>
            </div>
          )}

          {/* HELP */}
          {activeSection === 'help' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Get support</p>
              <div className="border border-gray-800 p-6">
                <p className="text-gray-600 text-sm">Support coming soon.</p>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  )
}
