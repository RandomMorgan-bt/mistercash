'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [activeSection, setActiveSection] = useState('chats')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
    } else {
        setUser(user)

        const { data: profile } = await supabase
         .from('profiles')
         .select('onboarding_completed')
         .eq('user_id', user.id)
         .single()

    if (!profile || !profile.onboarding_completed) {
        router.push('/onboarding')
     }
    }
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const navItems = [
    { id: 'chats',        label: 'Chats',           icon: '💬' },
    { id: 'tasks',        label: 'Tasks',            icon: '✅' },
    { id: 'progress',     label: 'Progress',         icon: '📈' },
    { id: 'certificates', label: 'Certificates',     icon: '🏆' },
    { id: 'portfolio',    label: 'Portfolio',        icon: '📁' },
    { id: 'career',       label: 'Career Roadmap',   icon: '🚀' },
    { id: 'profile',      label: 'Profile',          icon: '👤' },
    { id: 'subscription', label: 'Subscription',     icon: '💳' },
    { id: 'settings',     label: 'Settings',         icon: '⚙️' },
    { id: 'help',         label: 'Help',             icon: '❓' },
  ]

  return (
    <div className="min-h-screen bg-black flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white tracking-widest">
            MISTER <span className="text-green-400">CASH</span>
          </h1>
        </div>

        {/* Mister Cash Character */}
        <div className="flex flex-col items-center py-6 border-b border-gray-800">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="text-6xl animate-bounce">💵</div>
            <div className="absolute bottom-0 right-0 text-2xl">⌚</div>
          </div>
          <div className="mt-3 bg-gray-800 text-green-400 text-xs px-3 py-2 rounded-lg max-w-40 text-center border border-gray-700">
            Ready to learn something real today?
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm text-left transition-all ${
                activeSection === item.id
                  ? 'bg-green-400 text-black font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              <span className="tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User + Logout */}
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
      <main className="flex-1 flex flex-col">

        {/* Top bar */}
        <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold tracking-widest text-lg uppercase">
            {navItems.find(i => i.id === activeSection)?.label}
          </h2>
          <p className="text-gray-500 text-sm">
            Welcome back,{' '}
            <span className="text-green-400">
              {user?.user_metadata?.display_name || 'user'}
            </span>
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">

          {activeSection === 'chats' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your conversations with Mister Cash</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-gray-600 text-sm">No chats yet. Start your first session with Mister Cash.</p>
                <button className="mt-4 bg-green-400 text-black font-bold px-6 py-3 text-sm tracking-widest hover:bg-green-300 transition-all">
                  START LEARNING
                </button>
              </div>
            </div>
          )}

          {activeSection === 'tasks' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your active task boxes</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-gray-600 text-sm">No tasks yet. Tasks will appear here once Mister Cash assigns them.</p>
              </div>
            </div>
          )}

          {activeSection === 'progress' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your skill levels and learning journey</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-gray-600 text-sm">No progress tracked yet. Start learning to see your growth.</p>
              </div>
            </div>
          )}

          {activeSection === 'certificates' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your Mister Cash certifications</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-gray-600 text-sm">No certificates earned yet. Keep learning to earn your first one.</p>
              </div>
            </div>
          )}

          {activeSection === 'portfolio' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Projects you have built and submitted</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-gray-600 text-sm">No projects yet. Submit your first project to build your portfolio.</p>
              </div>
            </div>
          )}

          {activeSection === 'career' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Your personalised roadmap to your first opportunity</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-gray-600 text-sm">Your career roadmap will unlock once you reach the right level.</p>
              </div>
            </div>
          )}

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

          {activeSection === 'subscription' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Manage your plan</p>
              <div className="border border-gray-800 p-8 text-center">
                <p className="text-green-400 font-bold tracking-widest mb-2">FREE TRIAL</p>
                <p className="text-gray-600 text-sm">14 days remaining. Upgrade to keep learning without limits.</p>
                <button className="mt-4 bg-green-400 text-black font-bold px-6 py-3 text-sm tracking-widest hover:bg-green-300 transition-all">
                  UPGRADE NOW
                </button>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div>
              <p className="text-gray-500 text-sm mb-6 tracking-wide">Account settings</p>
              <div className="border border-gray-800 p-6">
                <p className="text-gray-600 text-sm">Settings coming soon.</p>
              </div>
            </div>
          )}

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
