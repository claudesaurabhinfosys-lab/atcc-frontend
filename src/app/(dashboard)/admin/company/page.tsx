'use client'

import { useSession } from 'next-auth/react'

export default function AdminCompanyPage() {
  const { data: session } = useSession()
  const company = (session?.user as any)?.company

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your company profile and branding</p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Company Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Company Name</p><p className="font-medium text-gray-900 mt-0.5">{company?.name ?? 'ATCC Platform'}</p></div>
          <div><p className="text-gray-500">Knowledge Version</p><p className="font-medium text-gray-900 mt-0.5">{company?.knowledge_version ?? 'v5'}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Branding</h2>
        <p className="text-sm text-gray-500">Custom logo and colours — coming soon.</p>
      </div>
    </div>
  )
}
