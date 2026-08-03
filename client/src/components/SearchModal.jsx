import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Star, Calendar, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const { shows, image_base_url } = useAppContext()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
      setQuery('')
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredMovies = query.trim() === ''
    ? []
    : shows.filter(show =>
        show.title?.toLowerCase().includes(query.toLowerCase()) ||
        show.genres?.some(g => g.name?.toLowerCase().includes(query.toLowerCase()))
      )

  const handleSelectMovie = (id) => {
    onClose()
    navigate(`/movies/${id}`)
    window.scrollTo(0, 0)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#121216] border border-white/15 rounded-2xl shadow-2xl overflow-hidden glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies by title or genre..."
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-base font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-white p-1 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-semibold px-2.5 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition"
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 no-scrollbar">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              Start typing to search for movies on <span className="text-primary font-semibold">QuickShow</span>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              No movies found for "<span className="text-white font-medium">{query}</span>"
            </div>
          ) : (
            filteredMovies.map((movie) => {
              const imagePath = movie.backdrop_path || movie.poster_path
              return (
                <div
                  key={movie._id}
                  onClick={() => handleSelectMovie(movie._id)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition duration-200 cursor-pointer group border border-transparent hover:border-primary/30"
                >
                  <img
                    src={imagePath?.startsWith('http') ? imagePath : image_base_url + imagePath}
                    alt={movie.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-base truncate group-hover:text-primary transition">
                      {movie.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {movie.vote_average?.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                      <span>•</span>
                      <span className="truncate">
                        {movie.genres?.slice(0, 2).map(g => g.name).join(', ')}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary group-hover:translate-x-1 transition" />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchModal
