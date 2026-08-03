import React, { useEffect, useState } from 'react'
import { TableSkeleton } from '../../components/Skeleton'
import Title from '../../components/admin/Title'
import { useAppContext } from '../../context/AppContext'
import { Film, Calendar, Ticket, DollarSign } from 'lucide-react'

const ListShows = () => {
  const { axios, getToken, user } = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY

  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  const dateFormat = (isoString) => {
    return new Date(isoString).toLocaleString()
  }

  const getAllShows = async () => {
    try {
      const token = await getToken()
      if (!token) return

      const { data } = await axios.get('/api/admin/all-shows', {
        headers: { Authorization: `Bearer ${token}` }
      })

      setShows(data.shows || [])
    } catch (error) {
      console.error('Error fetching shows:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) getAllShows()
  }, [user])

  return !loading ? (
    <div className="space-y-6 max-w-6xl">
      <Title text1="List" text2="Shows" />

      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10 border-b border-white/10 text-white font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Movie Name</th>
                <th className="py-4 px-6">Showtime</th>
                <th className="py-4 px-6">Bookings</th>
                <th className="py-4 px-6">Total Earnings</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
              {shows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                    No shows currently added.
                  </td>
                </tr>
              ) : (
                shows.map((show, index) => {
                  const occupiedCount = show.occupiedSeats
                    ? Object.keys(show.occupiedSeats).length
                    : 0
                  const earnings = occupiedCount * (show.showPrice || 0)

                  return (
                    <tr
                      key={index}
                      className="hover:bg-white/[0.04] transition duration-150"
                    >
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                        <Film className="w-4 h-4 text-primary shrink-0" />
                        <span>{show.movie?.title || 'Unknown Movie'}</span>
                      </td>

                      <td className="py-4 px-6 text-gray-300">
                        {dateFormat(show.showDateTime)}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-white">
                          {occupiedCount} seats
                        </span>
                      </td>

                      <td className="py-4 px-6 font-extrabold text-primary">
                        {currency}{earnings}
                      </td>
                    </tr>
                  )
                })
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

export default ListShows
