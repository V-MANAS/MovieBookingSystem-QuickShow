import React, { useEffect, useState } from 'react'
import { TableSkeleton } from '../../components/Skeleton'
import Title from '../../components/admin/Title'
import { useAppContext } from '../../context/AppContext'
import { User, Film, Calendar, Ticket, DollarSign } from 'lucide-react'

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY
  const { axios, getToken, user } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const dateFormat = (isoString) => {
    return new Date(isoString).toLocaleString()
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
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      getAllBookings()
    }
  }, [user])

  return !isLoading ? (
    <div className="space-y-6 max-w-6xl">
      <Title text1="List" text2="Bookings" />

      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10 border-b border-white/10 text-white font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Movie</th>
                <th className="py-4 px-6">Showtime</th>
                <th className="py-4 px-6">Seats</th>
                <th className="py-4 px-6">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                    No bookings found in system.
                  </td>
                </tr>
              ) : (
                bookings.map((item, index) => (
                  <tr key={index} className="hover:bg-white/[0.04] transition duration-150">
                    <td className="py-4 px-6 font-semibold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-primary shrink-0" />
                      <span>{item.user?.name || item.user?.email || 'Guest User'}</span>
                    </td>

                    <td className="py-4 px-6 font-bold text-white">
                      {item.show?.movie?.title || 'Unknown Movie'}
                    </td>

                    <td className="py-4 px-6 text-gray-300">
                      {dateFormat(item.show?.showDateTime)}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(item.bookedSeats) ? (
                          item.bookedSeats.map(seat => (
                            <span
                              key={seat}
                              className="px-2 py-0.5 rounded bg-primary/15 border border-primary/30 text-primary text-xs font-bold"
                            >
                              {seat}
                            </span>
                          ))
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-extrabold text-primary">
                      {currency}{item.amount}
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