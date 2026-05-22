import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabase'
import { exportToCSV } from '../../lib/exportUtils'
import { formatCurrency } from '../../hooks/useBookings'

const QUICK_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' }
]

const STATUS_COLORS = {
  new: '#3B82F6',
  assigned: '#F59E0B',
  en_route: '#F97316',
  completed: '#22C55E',
  cancelled: '#EF4444'
}

const formatDateKey = (date, monthly) => {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return monthly ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : d.toISOString().split('T')[0]
}

const formatDisplayLabel = (key) => {
  if (!key) return ''
  if (key.length === 7) {
    const [year, month] = key.split('-')
    return `${month}/${year}`
  }
  const [year, month, day] = key.split('-')
  return `${day}/${month}`
}

export default function Analytics() {
  const [range, setRange] = useState('week')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bookings, setBookings] = useState([])
  const [assignments, setAssignments] = useState([])
  const [driverPerformance, setDriverPerformance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [performanceSort, setPerformanceSort] = useState({ key: 'trips_completed', direction: 'desc' })

  const setQuickRange = useCallback((value) => {
    setRange(value)
    const now = new Date()
    if (value === 'custom') {
      return
    }
    if (value === 'today') {
      const today = now.toISOString().split('T')[0]
      setStartDate(today)
      setEndDate(today)
      return
    }
    if (value === 'week') {
      const start = new Date(now)
      start.setDate(now.getDate() - 6)
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(now.toISOString().split('T')[0])
      return
    }
    if (value === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(now.toISOString().split('T')[0])
      return
    }
    if (value === 'year') {
      const start = new Date(now.getFullYear(), 0, 1)
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(now.toISOString().split('T')[0])
      return
    }
  }, [])

  useEffect(() => {
    if (!startDate || !endDate) {
      setQuickRange('week')
    }
  }, [setQuickRange, startDate, endDate])

  const loadAnalytics = useCallback(async () => {
    if (!startDate || !endDate) return
    try {
      setError(null)
      setLoading(true)
      const startIso = new Date(`${startDate}T00:00:00`).toISOString()
      const endIso = new Date(`${endDate}T23:59:59`).toISOString()

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: true })

      if (bookingsError) throw bookingsError
      setBookings(bookingsData || [])

      const bookingIds = (bookingsData || []).map((booking) => booking.id)
      if (bookingIds.length > 0) {
        const { data: assignmentRows, error: assignmentError } = await supabase
          .from('booking_assignments')
          .select('booking_id, assigned_at, completed_at')
          .in('booking_id', bookingIds)

        if (assignmentError) throw assignmentError
        setAssignments(assignmentRows || [])
      } else {
        setAssignments([])
      }

      const { data: performanceData, error: performanceError } = await supabase
        .from('driver_performance')
        .select('*, drivers (name)')

      if (performanceError) throw performanceError
      setDriverPerformance(performanceData || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  useEffect(() => {
    const channel = supabase.channel('analytics-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadAnalytics()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_assignments' }, () => {
        loadAnalytics()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_performance' }, () => {
        loadAnalytics()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadAnalytics])

  const dateRangeDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  }, [startDate, endDate])

  const monthlyAggregation = dateRangeDays > 90 || range === 'year'

  const revenueSeries = useMemo(() => {
    const buckets = new Map()
    bookings.forEach((booking) => {
      const key = formatDateKey(booking.created_at, monthlyAggregation)
      if (!key) return

      const paymentStatus = String(booking.payment_status || '').toLowerCase()
      const reservationPaid = paymentStatus === 'reservation_paid' || paymentStatus === 'paid'
      const finalPaid = paymentStatus === 'paid'

      const reservationFee = Number(booking.price_amount ?? 0)
      const totalPrice = Number(booking.total_price ?? booking.total_fare ?? 0)
      const safeReservation = Number.isNaN(reservationFee) ? 0 : reservationFee
      const safeTotal = Number.isNaN(totalPrice) ? 0 : totalPrice
      const finalPayment = Math.max(safeTotal - safeReservation, 0)

      const existing = buckets.get(key) || { reservation: 0, final: 0 }
      if (reservationPaid) existing.reservation += safeReservation
      if (finalPaid) existing.final += finalPayment
      buckets.set(key, existing)
    })

    return Array.from(buckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => ({
        name: formatDisplayLabel(key),
        reservation: value.reservation,
        final: value.final
      }))
  }, [bookings, monthlyAggregation])

  const totalRevenue = useMemo(
    () => revenueSeries.reduce((sum, item) => sum + item.reservation + item.final, 0),
    [revenueSeries]
  )

  const statusBreakdown = useMemo(() => {
    const counts = bookings.reduce(
      (acc, booking) => {
        const status = booking.status || 'new'
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {
        new: 0,
        assigned: 0,
        en_route: 0,
        completed: 0,
        cancelled: 0
      }
    )
    return Object.entries(counts).map(([status, value]) => ({
      name: status.replace('_', ' '),
      value,
      status
    }))
  }, [bookings])

  const metrics = useMemo(() => {
    const total = bookings.length || 1
    const completed = bookings.filter((booking) => booking.status === 'completed').length
    const cancelled = bookings.filter((booking) => booking.status === 'cancelled').length
    const completionRate = Math.round((completed / total) * 100)
    const cancellationRate = Math.round((cancelled / total) * 100)

    let totalMinutes = 0
    let assignmentCount = 0
    assignments.forEach((assignment) => {
      if (!assignment.assigned_at) return
      const booking = bookings.find((b) => b.id === assignment.booking_id)
      if (!booking?.created_at) return
      const diffMs = new Date(assignment.assigned_at) - new Date(booking.created_at)
      if (diffMs >= 0) {
        totalMinutes += diffMs / (1000 * 60)
        assignmentCount += 1
      }
    })
    const avgTimeToAssign = assignmentCount ? Math.round(totalMinutes / assignmentCount) : 0

    const vehicleCounts = bookings.reduce((acc, booking) => {
      const vehicle = booking.vehicle_type || 'Unknown'
      acc[vehicle] = (acc[vehicle] || 0) + 1
      return acc
    }, {})
    const mostPopularVehicle = Object.entries(vehicleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

    return {
      completionRate,
      cancellationRate,
      avgTimeToAssign,
      mostPopularVehicle
    }
  }, [bookings, assignments])

  const topRoutes = useMemo(() => {
    const counts = {}
    bookings.forEach((booking) => {
      const pickup = booking.pickup_location || 'Pickup'
      const destination = booking.destination || booking.destination_location || 'Destination'
      const label = `${pickup} → ${destination}`
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({
        name: label.length > 20 ? `${label.slice(0, 20)}…` : label,
        value
      }))
  }, [bookings])

  const sortedPerformance = useMemo(() => {
    const sorted = [...driverPerformance]
    sorted.sort((a, b) => {
      const aVal = a[performanceSort.key] ?? 0
      const bVal = b[performanceSort.key] ?? 0
      if (aVal === bVal) return 0
      const comparison = aVal > bVal ? 1 : -1
      return performanceSort.direction === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [driverPerformance, performanceSort])

  const togglePerformanceSort = (key) => {
    setPerformanceSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'desc' }
    })
  }

  const exportBookings = () => {
    if (!startDate || !endDate) return
    const fileName = `roam-analytics-${startDate}-${endDate}.csv`
    exportToCSV(bookings, fileName)
  }

  return (
    <AdminLayout>
      <style>{`
        @media print {
          aside, header { display: none !important; }
          main { padding: 0 !important; }
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
            <p className="text-sm text-gray-500 mt-1">Performance overview for the selected period.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportBookings}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md bg-[#B35A38] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_RANGES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setQuickRange(item.value)}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                range === item.value ? 'bg-[#B35A38] text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="date"
                className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <div className="text-sm text-gray-500">Loading analytics...</div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
                <span className="text-2xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="reservation" stroke="#B35A38" name="Reservation Fees" />
                    <Line type="monotone" dataKey="final" stroke="#2563EB" name="Final Payments" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="value" nameKey="name" label>
                      {statusBreakdown.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#9CA3AF'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Operational Metrics</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Completion Rate</p>
                    <p className="text-xl font-semibold text-gray-900">{metrics.completionRate}%</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Cancellation Rate</p>
                    <p className="text-xl font-semibold text-gray-900">{metrics.cancellationRate}%</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Avg Time to Assign</p>
                    <p className="text-xl font-semibold text-gray-900">{metrics.avgTimeToAssign} min</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Most Popular Vehicle</p>
                    <p className="text-xl font-semibold text-gray-900">{metrics.mostPopularVehicle}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Routes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRoutes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#B35A38" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Driver Name</th>
                      <th className="px-4 py-3 text-left">
                        <button type="button" onClick={() => togglePerformanceSort('trips_completed')} className="font-semibold">
                          Trips Completed
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button type="button" onClick={() => togglePerformanceSort('average_rating')} className="font-semibold">
                          Avg Rating
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">On-Time Rate</th>
                      <th className="px-4 py-3 text-left">Cancellation Rate</th>
                      <th className="px-4 py-3 text-left">
                        <button type="button" onClick={() => togglePerformanceSort('earnings_total')} className="font-semibold">
                          Total Earnings
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPerformance.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-gray-400">
                          No driver performance data.
                        </td>
                      </tr>
                    ) : (
                      sortedPerformance.map((row) => (
                        <tr key={row.id} className="border-t border-gray-100">
                          <td className="px-4 py-3 font-semibold text-gray-900">{row.drivers?.name || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{row.trips_completed ?? 0}</td>
                          <td className="px-4 py-3 text-gray-600">{Number(row.average_rating ?? 0).toFixed(1)}</td>
                          <td className="px-4 py-3 text-gray-600">{Math.round((row.on_time_rate ?? 0) * 100)}%</td>
                          <td className="px-4 py-3 text-gray-600">{Math.round((row.cancellation_rate ?? 0) * 100)}%</td>
                          <td className="px-4 py-3 text-gray-600">{formatCurrency(row.earnings_total ?? 0)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
