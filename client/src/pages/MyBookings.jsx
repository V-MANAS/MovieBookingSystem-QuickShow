import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'
import { useAppContext } from '../context/AppContext'
import { TableSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import TicketQRCode from '../components/TicketQRCode'
import generateTicketPDF from '../utils/generateTicketPDF'
import { formatPrice } from '../lib/formatPrice'
import { getTheatreInfo } from '../constants/cinema'
import { Ticket, Calendar, Clock, MapPin, CheckCircle, AlertCircle, Download, Lock } from 'lucide-react'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY || '$'
  const { axios, getToken, image_base_url } = useAppContext()
  const { user, isLoaded } = useUser()
  const { openSignIn } = useClerk()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const bookingId = searchParams.get('bookingId')

  const getMyBookings = async () => {
    try {
      const token = await getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      // If user arrives with session_id, verify payment with Stripe
      if (sessionId && bookingId) {
        try {
          await axios.post('/api/booking/verify-payment', { sessionId, bookingId }, { headers })
        } catch (e) {
          console.warn('Payment verify call note:', e.message)
        }
      }

      const { data } = await axios.get('/api/user/my-bookings', { headers })

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
    if (isLoaded) {
      if (user) {
        getMyBookings()
      } else {
        setIsLoading(false)
      }
    }
  }, [user, isLoaded, sessionId, bookingId])

  if (!isLoaded || isLoading) {
    return <TableSkeleton rows={4} />
  }

  // Guidance for unauthenticated users
  if (!user) {
    return (
      <main className="relative pt-28 pb-20 px-6 md:px-16 lg:px-24 min-h-[80vh] max-w-4xl mx-auto flex items-center justify-center">
        <EmptyState
          icon={Lock}
          title="Sign In Required"
          description="Please sign in to view your booked movie passes, QR codes, and PDF tickets."
          actionText="Sign In"
          onAction={openSignIn}
        />
      </main>
    )
  }

  /**
   * Dynamically renders payment status badge based on booking data
   */
  const renderPaymentStatusBadge = (item) => {
    const isConfirmed = item.isPaid === true || item.paymentStatus === 'paid' || item.status === 'confirmed'
    const isFailed = item.isFailed === true || item.paymentStatus === 'failed' || item.status === 'failed'

    if (isConfirmed) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <span>✅</span>
          <span>Confirmed</span>
        </span>
      )
    }

    if (isFailed) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
          <span>❌</span>
          <span>Payment Failed</span>
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
        <span>⏳</span>
        <span>Pending Payment</span>
      </span>
    )
  }

  return (
    <main className="relative pt-28 pb-20 px-6 md:px-16 lg:px-24 xl:px-36 min-h-[85vh] max-w-7xl mx-auto overflow-hidden">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
            <Ticket className="w-4 h-4" />
            Digital Ticket Pass Wallet
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">My Bookings</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            View your confirmed cinema passes, QR codes, and PDF ticket downloads
          </p>
        </div>
      </div>

      {/* Content */}
      {bookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No Ticket Reservations Found"
          description="You haven't booked any movie tickets yet. Browse available blockbusters and reserve your seats today!"
          actionText="Browse Shows"
          actionLink="/movies"
        />
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {bookings.map((item, index) => {
            const movie = item.show?.movie
            const posterPath = movie?.poster_path
            const posterUrl = posterPath
              ? (posterPath.startsWith('http') ? posterPath : image_base_url + posterPath)
              : '/backgroundImage.png'

            const theatreName = getTheatreInfo(item?.show)
            const showDateObj = item.show?.showDateTime ? new Date(item.show.showDateTime) : new Date()

            const formattedDate = showDateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })

            const formattedTime = showDateObj.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })

            const seatsList = item.bookedSeats || ['Standard']
            const qrElementId = `qr-mybookings-${item._id}`

            const handleDownloadPDF = () => {
              generateTicketPDF({
                bookingId: item._id || `PASS-${index + 101}`,
                movieTitle: movie?.title || 'Movie Ticket',
                theatre: theatreName,
                showDate: formattedDate,
                showTime: formattedTime,
                seats: seatsList,
                amount: item.amount || 0,
                isPaid: item.isPaid,
                posterUrl: posterUrl,
                qrElementId: qrElementId
              })
            }

            return (
              <div
                key={item._id || index}
                className="group relative flex flex-col md:flex-row bg-[#121217] border border-white/10 hover:border-primary/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Left Poster Thumbnail */}
                <div className="md:w-48 h-48 md:h-auto relative shrink-0 overflow-hidden bg-gray-900 aspect-[2/3]">
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

                {/* Center Details */}
                <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-xl font-extrabold text-white group-hover:text-primary transition line-clamp-1">
                        {movie?.title || 'Movie Show'}
                      </h3>
                      {renderPaymentStatusBadge(item)}
                    </div>

                    <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {theatreName}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-2 font-medium">
                      <span className="flex items-center gap-1 text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {movie?.runtime ? timeFormat(movie.runtime) : '2h 15m'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-gray-300">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {formattedDate} ({formattedTime})
                      </span>
                    </div>
                  </div>

                  {/* Seat Chips & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Seat Numbers</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {seatsList.map((seat) => (
                          <span
                            key={seat}
                            className="px-2.5 py-0.5 rounded-lg bg-primary/15 border border-primary/30 text-primary text-xs font-bold"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Amount</p>
                        <p className="text-lg font-black text-white">{formatPrice(item.amount)}</p>
                      </div>

                      <button
                        onClick={handleDownloadPDF}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dull text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 transition hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Ticket</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Embedded QR Preview */}
                <div className="flex flex-col items-center justify-center p-5 bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/10 shrink-0">
                  <TicketQRCode
                    id={qrElementId}
                    bookingId={item._id || 'CONFIRMED'}
                    movieTitle={movie?.title || 'Movie'}
                    theatre={theatreName}
                    date={formattedDate}
                    time={formattedTime}
                    seats={seatsList}
                    size={95}
                  />
                  <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-2">
                    Scan for Booking Details
                  </span>
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
