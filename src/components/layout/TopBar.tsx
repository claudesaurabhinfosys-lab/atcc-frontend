'use client'

import { signOut, useSession } from 'next-auth/react'
import { Bell, LogOut } from 'lucide-react'

export function TopBar() {
  const { data: session } = useSession()

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
          <Bell size={18} className="text-gray-500" />
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </header>
  )
}
