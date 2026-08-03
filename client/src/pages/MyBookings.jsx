import React, { useEffect, useState } from 'react'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'
import { useAppContext } from '../context/AppContext'
import { TableSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { Ticket, Calendar, Clock, MapPin, CheckCircle, AlertCircle, QrCode } from 'lucide-react'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY
  const { axios, getToken, user, image_base_url } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/user/my-bookings', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })

      if (data.success) {
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      getMyBookings()
    }
  }, [user])

  return (
    <main className="relative pt-28 pb-20 px-6 md:px-16 lg:px-24 xl:px-36 min-h-[85vh] max-w-7xl mx-auto overflow-hidden">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
            <Ticket className="w-4 h-4" />
            Ticket Pass Wallet
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">My Bookings</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            View your confirmed movie passes and active ticket reservations
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No Ticket Reservations Found"
          description="You haven't booked any movie tickets yet. Browse available blockbusters and reserve your seats today!"
          actionText="Browse Shows"
          actionLink="/movies"
        />
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {bookings.map((item, index) => {
            const movie = item.show?.movie
            const posterPath = movie?.poster_path
            const posterUrl = posterPath
              ? (posterPath.startsWith('http') ? posterPath : image_base_url + posterPath)
              : '/backgroundImage.png'

            return (
              <div
                key={index}
                className="group relative flex flex-col md:flex-row bg-[#121217] border border-white/10 hover:border-primary/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Left Ticket Stub Poster */}
                <div className="md:w-56 h-48 md:h-auto relative shrink-0 overflow-hidden bg-gray-900">
                  <img
                    src={posterUrl}
                    alt={movie?.title || 'Movie Poster'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#121217]" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/15">
                    IMAX 2D
                  </div>
                </div>

                {/* Center Ticket Main Details */}
                <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-extrabold text-white group-hover:text-primary transition line-clamp-1">
                        {movie?.title || 'Movie Show'}
                      </h3>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full border ${
                        item.isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.isPaid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {item.isPaid ? 'Confirmed' : 'Pending Payment'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-2 font-medium">
                      <span className="flex items-center gap-1 text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {movie?.runtime ? timeFormat(movie.runtime) : '2h 15m'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-gray-300">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {item.show?.showDateTime ? dateFormat(item.show.showDateTime) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Seat Numbers & Ticket Count */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Seat Numbers</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {item.bookedSeats && item.bookedSeats.length > 0 ? (
                          item.bookedSeats.map((seat) => (
                            <span
                              key={seat}
                              className="px-2.5 py-0.5 rounded-lg bg-primary/15 border border-primary/30 text-primary text-xs font-bold"
                            >
                              {seat}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Standard Seats</span>
                        )}
                      </div>
                    </div>

                    {/* Price & Pay Action */}
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Total Amount</p>
                        <p className="text-xl font-black text-white">
                          {currency}{item.amount}
                        </p>
                      </div>

                      {!item.isPaid && (
                        <button className="px-5 py-2 bg-primary hover:bg-primary-dull text-white text-xs font-bold rounded-full shadow-lg shadow-primary/30 transition hover:scale-105 active:scale-95 cursor-pointer">
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Decorative Stub Notch & Barcode */}
                <div className="hidden lg:flex flex-col items-center justify-center p-6 border-l border-dashed border-white/15 bg-white/[0.01] w-24 shrink-0">
                  <QrCode className="w-12 h-12 text-gray-500 opacity-60 group-hover:opacity-100 group-hover:text-primary transition" />
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mt-2">PASS #{index + 101}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default MyBookings
