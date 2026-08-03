import React, { useEffect, useState } from 'react'
import { Star, Check, Trash2, Search, Plus, Calendar, DollarSign, Film, Video } from 'lucide-react'
import Title from '../../components/admin/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddShows = () => {
  const { axios, getToken, user, image_base_url } = useAppContext()

  const currency = import.meta.env.VITE_CURRENCY
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('Batman')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [dateTimeSelection, setDateTimeSelection] = useState({})
  const [dateTimeInput, setDateTimeInput] = useState('')
  const [showPrice, setShowPrice] = useState('')
  const [trailerUrl, setTrailerUrl] = useState('')
  const [addingShow, setAddingShow] = useState(false)

  const searchMovies = async (query) => {
    if (!query) return
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`
      )

      const data = await res.json()

      if (data.Search) {
        setSearchResults(data.Search)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('OMDb fetch error:', error)
    }
  }

  useEffect(() => {
    if (user) {
      searchMovies(searchQuery)
    }
  }, [user])

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return
    const [date, time] = dateTimeInput.split('T')
    if (!date || !time) return

    setDateTimeSelection((prev) => {
      const times = prev[date] || []
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] }
      }
      return prev
    })
  }

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time)
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [date]: filteredTimes,
      }
    })
  }

  const handleSubmit = async () => {
    try {
      setAddingShow(true)

      if (!selectedMovie || Object.keys(dateTimeSelection).length === 0 || !showPrice) {
        return toast.error('Please fill in all required fields!')
      }

      const showsInput = Object.entries(dateTimeSelection).map(([date, time]) => ({
        date,
        time,
      }))

      const payload = {
        movieId: selectedMovie,
        showsInput,
        showPrice: Number(showPrice),
        trailerUrl: trailerUrl.trim(),
      }

      const { data } = await axios.post('/api/show/add', payload, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      })

      if (data.success) {
        toast.success(data.message)
        setSelectedMovie(null)
        setDateTimeSelection({})
        setShowPrice('')
        setTrailerUrl('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('An error occurred. Please try again!')
    } finally {
      setAddingShow(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <Title text1="Add" text2="Shows" />

      {/* Movie Search Field */}
      <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          1. Search & Select Movie
        </label>
        <div className="flex gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies (e.g. Batman)"
              className="w-full bg-white/[0.05] border border-white/10 focus:border-primary/50 text-sm font-medium text-white placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>
          <button
            onClick={() => searchMovies(searchQuery)}
            className="px-5 py-2.5 bg-primary hover:bg-primary-dull text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            Search
          </button>
        </div>

        {/* Results Grid */}
        <p className="mt-6 text-sm font-bold text-gray-300">Select Movie from Results:</p>
        {searchResults.length > 0 ? (
          <div className="overflow-x-auto pb-4 pt-2 no-scrollbar">
            <div className="flex gap-4 w-max">
              {searchResults.map((movie) => {
                const isSelected = selectedMovie === movie.imdbID
                return (
                  <div
                    key={movie.imdbID}
                    onClick={() => setSelectedMovie(movie.imdbID)}
                    className={`relative w-36 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-xl shadow-primary/20'
                        : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="relative h-48 bg-gray-900">
                      <img
                        src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                        alt={movie.Title}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded-full shadow-lg">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 bg-black/60 backdrop-blur-md">
                      <p className="font-bold text-xs text-white truncate">{movie.Title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{movie.Year}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2">No movies found.</p>
        )}
      </div>

      {/* Trailer URL Field */}
      <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          2. YouTube Trailer URL
        </label>
        <div className="flex items-center gap-2 border border-white/10 bg-white/[0.05] px-4 py-2.5 rounded-xl">
          <Video className="w-4 h-4 text-primary shrink-0" />
          <input
            type="url"
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
            className="bg-transparent outline-none text-white text-sm font-medium w-full placeholder-gray-400"
          />
        </div>
      </div>

      {/* Price & DateTime Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price Input */}
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            3. Ticket Price ({currency})
          </label>
          <div className="flex items-center gap-2 border border-white/10 bg-white/[0.05] px-4 py-2.5 rounded-xl">
            <span className="text-gray-400 text-sm font-bold">{currency}</span>
            <input
              min={0}
              type="number"
              value={showPrice}
              onChange={(e) => setShowPrice(e.target.value)}
              placeholder="Enter Show Price"
              className="bg-transparent outline-none text-white text-sm font-semibold w-full"
            />
          </div>
        </div>

        {/* Date Time Picker */}
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            4. Add Date & Showtime
          </label>
          <div className="flex items-center gap-3">
            <input
              type="datetime-local"
              value={dateTimeInput}
              onChange={(e) => setDateTimeInput(e.target.value)}
              className="bg-white/[0.05] border border-white/10 text-white text-xs font-medium px-3 py-2.5 rounded-xl outline-none flex-1"
            />
            <button
              onClick={handleDateTimeAdd}
              className="px-4 py-2.5 bg-primary/20 hover:bg-primary border border-primary/30 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
            >
              Add Time
            </button>
          </div>
        </div>
      </div>

      {/* Selected Timings Summary */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Scheduled Showtimes Overview
          </h4>
          <div className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <div key={date} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="text-xs font-bold text-primary">{date}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
                    >
                      <span>{time}</span>
                      <button
                        onClick={() => handleRemoveTime(date, time)}
                        className="text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={addingShow}
        className="w-full sm:w-auto px-10 py-3.5 bg-primary hover:bg-primary-dull text-white text-sm font-extrabold rounded-full shadow-xl shadow-primary/30 transition hover:scale-105 active:scale-95 cursor-pointer"
      >
        {addingShow ? 'Adding Show...' : 'Create & Publish Show'}
      </button>
    </div>
  )
}

export default AddShows