import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { CheckCircle2, Ticket, MapPin, Download, Home, Sparkles, Lock } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import TicketQRCode from '../components/TicketQRCode'
import generateTicketPDF from '../utils/generateTicketPDF'
import { formatPrice } from '../lib/formatPrice'
import { getTheatreInfo } from '../constants/cinema'
import { MovieDetailsSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import BlurCircle from '../components/BlurCircle'

const BookingSuccess = () => {
  const [searchParams] = useSearchParams()
  const { bookingId: paramBookingId } = useParams()
  const navigate = useNavigate()

  const sessionId = searchParams.get('session_id')
  const bookingId = searchParams.get('bookingId') || paramBookingId

  const currency = import.meta.env.VITE_CURRENCY || '$'
  const { axios, getToken, image_base_url } = useAppContext()
  const { user, isLoaded } = useUser()
  const { openSignIn } = useClerk()

  const [booking, setBooking] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(!!sessionId)

  const verifyAndFetchBooking = async () => {
    try {
      const token = await getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      // 1. If sessionId exists, verify payment with Stripe endpoint
      if (sessionId && bookingId) {
        try {
          await axios.post('/api/booking/verify-payment', { sessionId, bookingId }, { headers })
        } catch (e) {
          console.warn('Payment verify call note:', e.message)
        }
      }

      // 2. Fetch user's bookings to locate this bookingId
      if (token) {
        const { data } = await axios.get('/api/user/my-bookings', { headers })
        if (data.success && data.bookings) {
          const found = data.bookings.find(b => b._id === bookingId)
          if (found) {
            setBooking(found)
          } else if (data.bookings.length > 0) {
            setBooking(data.bookings[0]) // fallback to latest booking
          }
        }
      }
    } catch (error) {
      console.error('Error loading booking success details:', error)
    } finally {
      setIsLoading(false)
      setIsVerifying(false)
    }
  }

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        verifyAndFetchBooking()
      } else {
        setIsLoading(false)
        setIsVerifying(false)
      }
    }
    window.scrollTo(0, 0)
  }, [sessionId, bookingId, isLoaded, user])

  if (!isLoaded || isLoading || isVerifying) {
    return <MovieDetailsSkeleton />
  }

  // Guidance for unauthenticated users
  if (!user) {
    return (
      <main className="relative pt-28 pb-20 px-6 md:px-16 lg:px-24 min-h-[80vh] max-w-4xl mx-auto flex items-center justify-center">
        <EmptyState
          icon={Lock}
          title="Sign In Required"
          description="Please sign in to view your confirmed ticket pass details and download your ticket."
          actionText="Sign In"
          onAction={openSignIn}
        />
      </main>
    )
  }

  const movie = booking?.show?.movie
  const posterPath = movie?.poster_path
  const posterUrl = posterPath
    ? (posterPath.startsWith('http') ? posterPath : image_base_url + posterPath)
    : '/backgroundImage.png'

  const showDateTime = booking?.show?.showDateTime
    ? new Date(booking.show.showDateTime)
    : new Date()

  const formattedDate = showDateTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const formattedTime = showDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const seatsList = booking?.bookedSeats || ['Standard']
  const theatreName = getTheatreInfo(booking?.show)
  const isPaid = booking ? booking.isPaid : true

  const renderPaymentStatusBadge = () => {
    const isConfirmed = booking ? (booking.isPaid === true || booking.paymentStatus === 'paid' || booking.status === 'confirmed') : true
    const isFailed = booking ? (booking.isFailed === true || booking.paymentStatus === 'failed' || booking.status === 'failed') : false

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

  const handleDownloadPDF = () => {
    generateTicketPDF({
      bookingId: booking?._id || bookingId || 'CONFIRMED',
      movieTitle: movie?.title || 'Movie Ticket',
      theatre: theatreName,
      showDate: formattedDate,
      showTime: formattedTime,
      seats: seatsList,
      amount: booking?.amount || 0,
      isPaid: isPaid,
      posterUrl: posterUrl,
      qrElementId: `qr-success-${booking?._id || bookingId}`
    })
  }

  return (
    <main className="relative pt-28 pb-20 px-6 md:px-16 lg:px-24 min-h-[85vh] max-w-4xl mx-auto overflow-hidden">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="50px" right="50px" />

      {/* Confirmation Header Banner */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-4 shadow-xl shadow-emerald-500/30 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Payment Successful
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Booking Confirmed!</h1>
        <p className="text-sm text-gray-400 font-medium mt-1">
          Your digital ticket pass has been generated. See details below.
        </p>
      </div>

      {/* Digital Cinema Pass Card */}
      <div className="relative bg-[#121217] border border-white/15 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl mb-8">
        {/* Pass Top Accent Header */}
        <div className="bg-primary px-6 py-3 flex items-center justify-between text-white text-xs font-bold uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            QuickShow Digital Pass
          </span>
          <span>PASS #{booking?._id ? booking._id.slice(-6).toUpperCase() : 'TICKET'}</span>
        </div>

        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Movie Poster Thumbnail */}
          <div className="w-40 sm:w-44 shrink-0 rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-gray-900 aspect-[2/3]">
            <img
              src={posterUrl}
              alt={movie?.title || 'Movie Poster'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details Column */}
          <div className="flex-1 flex flex-col justify-between gap-6 w-full">
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-white">{movie?.title || 'Movie Show'}</h2>
                {renderPaymentStatusBadge()}
              </div>

              <p className="text-xs text-primary font-bold mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {theatreName}
              </p>
            </div>

            {/* Grid Breakdown */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
              <div>
                <span className="text-gray-400 font-semibold block text-[11px] uppercase tracking-wider">Date & Time</span>
                <span className="text-white font-bold block mt-0.5">{formattedDate}</span>
                <span className="text-gray-300 font-medium">{formattedTime}</span>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block text-[11px] uppercase tracking-wider">Booking ID</span>
                <span className="text-white font-bold block mt-0.5 font-mono text-[11px] truncate">
                  {booking?._id || bookingId || 'N/A'}
                </span>
                <span className="text-gray-300 font-medium">Total: {formatPrice(booking?.amount || 0)}</span>
              </div>
            </div>

            {/* Booked Seats */}
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">
                Booked Seats ({seatsList.length})
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {seatsList.map((seat) => (
                  <span
                    key={seat}
                    className="px-3 py-1 rounded-xl bg-primary/20 border border-primary/40 text-primary text-xs font-bold shadow-md"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl shrink-0">
            <TicketQRCode
              id={`qr-success-${booking?._id || bookingId}`}
              bookingId={booking?._id || bookingId || 'CONFIRMED'}
              movieTitle={movie?.title || 'Movie'}
              theatre={theatreName}
              date={formattedDate}
              time={formattedTime}
              seats={seatsList}
              size={120}
            />
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-2">
              Scan for Booking Details
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleDownloadPDF}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-dull text-white text-sm font-bold rounded-full shadow-xl shadow-primary/30 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Download className="w-4.5 h-4.5" />
          <span>Download Ticket PDF</span>
        </button>

        <button
          onClick={() => navigate('/my-bookings')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-semibold rounded-full transition cursor-pointer"
        >
          <Ticket className="w-4.5 h-4.5" />
          <span>Go to My Bookings</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/[0.05] hover:bg-white/10 text-gray-300 hover:text-white text-sm font-semibold rounded-full transition cursor-pointer"
        >
          <Home className="w-4.5 h-4.5" />
          <span>Back to Home</span>
        </button>
      </div>
    </main>
  )
}

export default BookingSuccess
