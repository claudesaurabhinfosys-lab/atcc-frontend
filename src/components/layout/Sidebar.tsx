'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, ClipboardList, BookOpen, BarChart2,
  Settings, Shield, Users, ChevronRight, Layers, ListChecks, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/assessments',   label: 'Assessments',   icon: ClipboardList },
  { href: '/risk-register', label: 'Risk Register', icon: Shield },
  { href: '/reports',       label: 'Reports',       icon: BarChart2 },
  { href: '/settings',      label: 'Settings',      icon: Settings },
]

// Sub-links under Knowledge Base, visible to super_admin only
const kbAdminItems = [
  { href: '/admin/super/risk-templates', label: 'Areas of Risk', icon: ListChecks },
  { href: '/admin/super/hazards',        label: 'Hazards List',  icon: AlertTriangle },
  { href: '/admin/super/scope-types',    label: 'Scope Types',   icon: Layers },
]

const adminItems = [
  { href: '/admin/users',   label: 'Users',       icon: Users },
  { href: '/admin/company', label: 'Company',     icon: Settings },
  { href: '/admin/super',   label: 'Super Admin', icon: Shield, superOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const roles = (session?.user as any)?.roles ?? []
  const isAdmin = roles.includes('super_admin') || roles.includes('company_admin')
  const isSuperAdmin = roles.some((r: any) => (typeof r === 'string' ? r : r?.name) === 'super_admin')
  const company = (session?.user as any)?.company

  const isKbActive = pathname.startsWith('/knowledge') || pathname.startsWith('/admin/super/risk-templates') || pathname.startsWith('/admin/super/scope-types')

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      {/* Logo / Company branding */}
      <div className="p-5 border-b">
        <div className="font-bold text-lg text-primary">
          {company?.branding?.logo ? (
            <img src={company.branding.logo} alt={company.name} className="h-8" />
          ) : (
            company?.name ?? 'ATCC Risk'
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Risk Management Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition',
              pathname.startsWith(href)
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}

        {/* Knowledge Base + super-admin sub-items */}
        <Link
          href="/knowledge"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition',
            isKbActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <BookOpen size={16} />
          Knowledge Base
        </Link>

        {isSuperAdmin && (
          <div className="ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5">
            {kbAdminItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition',
                  pathname.startsWith(href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                )}
              >
                <Icon size={13} />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
            </div>
            {adminItems
              .filter(item => !item.superOnly || isSuperAdmin)
              .map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition',
                    pathname === href
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
            {session?.user?.name?.charAt(0) ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{(typeof roles[0] === 'string' ? roles[0] : (roles[0] as any)?.name ?? '').replace(/_/g, ' ')}</p>
          </div>
          <ChevronRight size={14} className="text-gray-400" />
        </div>
      </div>
    </aside>
  )
}
