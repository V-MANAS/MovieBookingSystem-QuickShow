import React, { useEffect, useState } from 'react'
import { TableSkeleton } from '../../components/Skeleton'
import Title from '../../components/admin/Title'
import { useAppContext } from '../../context/AppContext'
import { formatPrice } from '../../lib/formatPrice'
import { User, Search, Filter, CheckCircle, Clock, XCircle, Ticket } from 'lucide-react'

const ListBookings = () => {
  const { axios, getToken, user } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const dateFormat = (isoString) => {
    if (!isoString) return 'N/A'
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAllBookings = async () => {
    try {
      const token = await getToken()
      if (!token) return

      const { data } = await axios.get('/api/admin/all-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })

      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Error loading bookings list:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      getAllBookings()
    }
  }, [user])

  // Filter bookings by search query (Booking ID or Movie Title) & payment status
  const filteredBookings = bookings.filter((item) => {
    const bookingId = (item._id || '').toLowerCase()
    const movieTitle = (item.show?.movie?.title || '').toLowerCase()
    const userName = (item.user?.name || item.user?.email || '').toLowerCase()
    const query = searchQuery.trim().toLowerCase()

    const matchesSearch =
      !query ||
      bookingId.includes(query) ||
      movieTitle.includes(query) ||
      userName.includes(query)

    const isPaid = item.isPaid === true
    let matchesStatus = true
    if (statusFilter === 'paid') {
      matchesStatus = isPaid
    } else if (statusFilter === 'pending') {
      matchesStatus = !isPaid
    }

    return matchesSearch && matchesStatus
  })

  return !isLoading ? (
    <div className="space-y-6 max-w-7xl">
      <Title text1="Bookings" text2="Management" />

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Booking ID or Movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl text-xs text-white placeholder-gray-400 outline-none transition"
          />
        </div>

        {/* Payment Status Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl text-xs font-semibold text-gray-200 outline-none cursor-pointer"
          >
            <option value="all" className="bg-gray-900 text-white">All Payment Statuses</option>
            <option value="paid" className="bg-gray-900 text-emerald-400">Confirmed & Paid</option>
            <option value="pending" className="bg-gray-900 text-amber-400">Pending / Failed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10 border-b border-white/10 text-white font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Booking ID</th>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Movie</th>
                <th className="py-4 px-6">Showtime</th>
                <th className="py-4 px-6">Seats</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400 text-sm">
                    No bookings found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.04] transition duration-150">
                    {/* Booking ID */}
                    <td className="py-4 px-6 font-mono text-xs text-gray-300 font-bold">
                      #{item._id ? item._id.slice(-8).toUpperCase() : 'N/A'}
                    </td>

                    {/* User */}
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {typeof item.user === 'object'
                            ? (item.user?.name || item.user?.email || item.user?._id || 'Guest')
                            : (item.user || 'Guest')}
                        </span>
                      </div>
                    </td>

                    {/* Movie */}
                    <td className="py-4 px-6 font-bold text-white max-w-[180px] truncate">
                      {item.show?.movie?.title || 'Unknown Movie'}
                    </td>

                    {/* Showtime */}
                    <td className="py-4 px-6 text-xs text-gray-300">
                      {dateFormat(item.show?.showDateTime)}
                    </td>

                    {/* Booked Seats */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(item.bookedSeats) && item.bookedSeats.length > 0 ? (
                          item.bookedSeats.map((seat) => (
                            <span
                              key={seat}
                              className="px-2 py-0.5 rounded-md bg-primary/15 border border-primary/30 text-primary text-[11px] font-bold"
                            >
                              {seat}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">Standard</span>
                        )}
                      </div>
                    </td>

                    {/* Payment Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        item.isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.isPaid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {item.isPaid ? 'Confirmed' : 'Pending'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 font-extrabold text-primary text-right">
                      {formatPrice(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <TableSkeleton rows={6} />
  )
}

export default ListBookings