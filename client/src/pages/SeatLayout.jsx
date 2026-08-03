import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MovieDetailsSkeleton } from '../components/Skeleton'
import { Clock, ArrowRight, ShieldCheck, Ticket, Monitor, Info } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import { useClerk } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext'

const SeatLayout = () => {
  const { openSignIn } = useClerk()
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ]

  const tierLabels = {
    A: "VIP (₹350)",
    B: "VIP (₹350)",
    C: "Premium (₹280)",
    D: "Premium (₹280)",
    E: "Gold (₹220)",
    F: "Gold (₹220)",
    G: "Silver (₹180)",
    H: "Silver (₹180)",
    I: "Silver (₹180)",
    J: "Silver (₹180)",
  }

  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [occupiedSeats, setOccupiedSeats] = useState([])

  const navigate = useNavigate()
  const { axios, getToken, user } = useAppContext()

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if (data.success) {
        setShow(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getOccupiedSeats = async () => {
    if (!selectedTime?.showId) return

    try {
      const { data } = await axios.get(
        `/api/booking/seats/${selectedTime.showId}`
      )

      if (data.success) {
        setOccupiedSeats(data.occupiedSeats || [])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast.error('Please select show time first!')
    }

    if (occupiedSeats.includes(seatId)) {
      return toast('This seat is already booked!')
    }

    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast.error('You can select a maximum of 5 seats!')
    }

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId]
    )
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex items-center gap-3 mt-2">
      <span className="w-5 text-center text-xs font-bold text-gray-400">{row}</span>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`
          const isSelected = selectedSeats.includes(seatId)
          const isOccupied = occupiedSeats.includes(seatId)

          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              disabled={isOccupied}
              title={isOccupied ? 'Booked' : `Seat ${seatId}`}
              className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isSelected
                  ? 'bg-primary text-white border-2 border-white shadow-md shadow-primary/40 scale-110'
                  : isOccupied
                  ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed opacity-50'
                  : 'bg-white/[0.06] border border-white/15 text-gray-300 hover:bg-primary/20 hover:border-primary/50 hover:text-white'
              }`}
            >
              {seatId}
            </button>
          )
        })}
      </div>
      <span className="w-5 text-center text-xs font-bold text-gray-400">{row}</span>
    </div>
  )

  const bookTickets = async () => {
    try {
      if (!user) {
        toast.error('Please sign in to proceed with booking')
        openSignIn()
        return
      }

      if (!selectedSeats.length || !selectedTime) {
        return toast.error('Please select show time and seats!')
      }

      const { data } = await axios.post(
        '/api/booking/create',
        {
          showId: selectedTime.showId,
          selectedSeats,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      )

      if (data.success) {
        window.location.href = data.url
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getShow()
  }, [])

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats()
    }
  }, [selectedTime])

  if (!show) return <MovieDetailsSkeleton />

  const timeOptions = show?.dateTime?.[date] || []

  return (
    <main className="relative pt-28 pb-32 px-4 sm:px-8 lg:px-20 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Left Side: Sticky Timings Sidebar */}
        <aside className="w-full lg:w-72 bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-xl lg:sticky lg:top-28 shrink-0">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-white">Showtimes</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4 font-medium">Select your show timing for {date}</p>

          {timeOptions.length === 0 ? (
            <p className="text-xs text-gray-400 py-3">No showtimes available on this date.</p>
          ) : (
            <div className="space-y-2">
              {timeOptions.map((item) => {
                const isSelected = selectedTime?.time === item.time
                return (
                  <button
                    key={item.time}
                    onClick={() => setSelectedTime(item)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {isoTimeFormat(item.time)}
                    </span>
                    {isSelected && <ShieldCheck className="w-4 h-4 text-white" />}
                  </button>
                )
              })}
            </div>
          )}

          {/* Seat Status Legend */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Seat Legend</h4>
            <div className="space-y-2 text-xs text-gray-300 font-medium">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/15" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-primary border-2 border-white" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-gray-800 border border-gray-700 opacity-50" />
                <span>Booked</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side: Theater Screen & Seat Layout Map */}
        <div className="relative flex-1 flex flex-col items-center w-full bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
          <BlurCircle top="-100px" left="-100px" />
          <BlurCircle bottom="0" right="0" />

          {/* Screen Glow Banner */}
          <div className="w-full max-w-xl flex flex-col items-center my-4">
            <div className="w-full h-3 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full blur-[2px]" />
            <div className="w-full h-12 border-t-2 border-primary/60 rounded-[100%] bg-gradient-to-b from-primary/20 to-transparent flex items-center justify-center mt-1">
              <span className="text-[11px] font-bold text-gray-300 tracking-[0.3em] uppercase flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-primary" />
                ALL EYES THIS WAY • SCREEN
              </span>
            </div>
          </div>

          {/* Cinema Seats Matrix */}
          <div className="mt-8 overflow-x-auto w-full flex flex-col items-center pb-4 no-scrollbar">
            <div className="flex flex-col items-center gap-4 min-w-[340px]">
              {/* VIP Rows */}
              <div className="w-full text-center text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 py-1 rounded-full mb-1">
                VIP Tier (Rows A - B)
              </div>
              {groupRows[0].map((row) => renderSeats(row))}

              {/* Premium Rows */}
              <div className="w-full text-center text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 py-1 rounded-full mt-4 mb-1">
                Premium Tier (Rows C - D)
              </div>
              {groupRows[1].map((row) => renderSeats(row))}

              {/* Standard Gold / Silver Rows */}
              <div className="w-full text-center text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 border border-blue-400/20 py-1 rounded-full mt-4 mb-1">
                Standard Tier (Rows E - J)
              </div>
              {groupRows.slice(2).map((group, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {group.map((row) => renderSeats(row))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090B]/90 backdrop-blur-2xl border-t border-white/10 py-4 px-6 sm:px-12 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary hidden sm:block">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Selected Seats</p>
              <p className="text-base sm:text-lg font-bold text-white">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                <span className="text-xs text-gray-400 font-normal ml-2">
                  ({selectedSeats.length}/5 max)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button
              onClick={bookTickets}
              disabled={selectedSeats.length === 0 || !selectedTime}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
                selectedSeats.length > 0 && selectedTime
                  ? 'bg-primary hover:bg-primary-dull text-white shadow-primary/30 hover:scale-105 active:scale-95'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default SeatLayout
