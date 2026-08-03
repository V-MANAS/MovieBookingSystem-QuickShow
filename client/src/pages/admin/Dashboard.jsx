import {
  TrendingUp,
  CircleDollarSign,
  PlayCircle,
  Star,
  Film,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { TableSkeleton } from '../../components/Skeleton'
import Title from '../../components/admin/Title'
import BlurCircle from '../../components/BlurCircle'
import { dateFormat } from '../../lib/dateFormat'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppContext'
import { formatPrice } from '../../lib/formatPrice'

const Dashboard = () => {
  const { axios, getToken, user, image_base_url } = useAppContext()

  const [dashboardData, setDashboardData] = useState({
    totalMovies: 0,
    totalShows: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
  })

  const [loading, setLoading] = useState(true)

  const dashboardCards = [
    {
      title: 'Total Movies',
      value: dashboardData.totalMovies !== undefined ? dashboardData.totalMovies : (dashboardData.activeShows?.length || 0),
      icon: Film,
      color: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30',
    },
    {
      title: 'Total Shows',
      value: dashboardData.totalShows !== undefined ? dashboardData.totalShows : (dashboardData.activeShows?.length || 0),
      icon: PlayCircle,
      color: 'from-primary/20 to-primary/5 text-primary border-primary/30',
    },
    {
      title: 'Total Bookings',
      value: dashboardData.totalBookings || 0,
      icon: TrendingUp,
      color: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(dashboardData.totalRevenue || 0),
      icon: CircleDollarSign,
      color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
    },
  ]

  const fetchDashboardData = async () => {
    try {
      const token = await getToken()

      if (!token) {
        toast.error('User not authenticated')
        return
      }

      const { data } = await axios.get('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message || 'Failed to load dashboard')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchDashboardData()
  }, [user])

  return !loading ? (
    <div className="space-y-10 max-w-7xl">
      <Title text1="Admin" text2="Dashboard" />

      {/* Analytics Cards Grid */}
      <div className="relative">
        <BlurCircle top="100px" left="0" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-6 bg-gradient-to-br ${card.color} border rounded-3xl backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-black text-white mt-1.5">{card.value}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Shows Grid */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Film className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-white">Active Shows</h3>
        </div>

        <div className="relative">
          <BlurCircle top="100px" left="-10%" />

          {!dashboardData.activeShows || dashboardData.activeShows.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.03] border border-white/10 rounded-2xl text-gray-400 text-sm">
              No active shows scheduled yet. Add shows from the sidebar menu.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.isArray(dashboardData.activeShows) &&
                dashboardData.activeShows.map((show) => {
                  const posterUrl = show.movie?.poster_path
                    ? (show.movie.poster_path.startsWith('http')
                        ? show.movie.poster_path
                        : image_base_url + show.movie.poster_path)
                    : '/no-image.png'

                  return (
                    <div
                      key={show._id}
                      className="group flex flex-col justify-between bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-primary/40 rounded-2xl p-3.5 transition duration-300 shadow-xl overflow-hidden"
                    >
                      <div className="relative rounded-xl overflow-hidden aspect-[2/3] w-full bg-gray-900">
                        <img
                          src={posterUrl}
                          alt={show.movie?.title || 'Show Poster'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 shadow-lg">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{show.movie?.vote_average ? show.movie.vote_average.toFixed(1) : 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mt-3.5">
                        <h4 className="font-bold text-base text-white truncate">
                          {show.movie?.title || 'Unknown Movie'}
                        </h4>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs">
                          <span className="font-extrabold text-primary text-sm">
                            {formatPrice(show.showPrice)}
                          </span>
                          <span className="text-gray-400 font-medium">
                            {dateFormat(show.showDateTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <TableSkeleton rows={4} />
  )
}

export default Dashboard
