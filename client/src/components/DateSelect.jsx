import React, { useState } from 'react'
import BlurCircle from './BlurCircle'
import { Calendar, ChevronRight, ChevronLeft, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({ dateTime = {}, id }) => {
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const datesList = Object.keys(dateTime || {})

  const onBookHandler = () => {
    if (!selected) {
      toast.error('Please select a show date')
      return
    }

    navigate(`/movies/${id}/${selected}`)
    window.scrollTo(0, 0)
  }

  return (
    <div id="dateSelect" className="pt-16 pb-8">
      <div className="relative p-6 sm:p-8 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0px" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left Side - Date Selection Header & Chips */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Select Date</h3>
                <p className="text-xs text-gray-400 font-medium">Choose your preferred show date to view available seats</p>
              </div>
            </div>

            {/* Date Pills Grid / Flex */}
            {datesList.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No show dates currently scheduled.</p>
            ) : (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-2 no-scrollbar">
                {datesList.map((date) => {
                  const dateObj = new Date(date)
                  const dayNum = dateObj.getDate()
                  const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' })
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                  const isSelected = selected === date

                  return (
                    <button
                      key={date}
                      onClick={() => setSelected(date)}
                      className={`flex flex-col items-center justify-center min-w-[72px] h-[84px] p-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105 font-bold'
                          : 'bg-white/[0.04] border-white/10 hover:border-primary/40 hover:bg-white/[0.08] text-gray-300'
                      }`}
                    >
                      <span className="text-[11px] font-semibold tracking-wider uppercase opacity-80">{dayName}</span>
                      <span className="text-2xl font-black leading-tight my-0.5">{dayNum}</span>
                      <span className="text-[11px] font-medium uppercase opacity-90">{monthStr}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Side - Action CTA */}
          <div className="flex items-center justify-end lg:self-center shrink-0">
            <button
              onClick={onBookHandler}
              disabled={datesList.length === 0}
              className={`inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
                selected
                  ? 'bg-primary hover:bg-primary-dull text-white shadow-primary/30 hover:scale-105 active:scale-95'
                  : 'bg-white/10 text-gray-400 hover:bg-white/15'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Select Seats</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DateSelect
