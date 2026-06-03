import { Suspense } from 'react'
import { DashboardStats } from '@/components/assessment/DashboardStats'
import { RecentAssessments } from '@/components/assessment/RecentAssessments'
import { RiskRegisterSummary } from '@/components/assessment/RiskRegisterSummary'
import { RiskBandChart } from '@/components/charts/RiskBandChart'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your risk management activity</p>
      </div>

      <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse rounded-xl" />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-xl" />}>
          <RiskBandChart />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-xl" />}>
          <RiskRegisterSummary />
        </Suspense>
      </div>

      <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-xl" />}>
        <RecentAssessments />
      </Suspense>
    </div>
  )
}
