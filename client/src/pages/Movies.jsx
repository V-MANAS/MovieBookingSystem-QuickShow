import React, { useState } from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { MovieGridSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { useAppContext } from '../context/AppContext'
import { Film, Search, Sparkles } from 'lucide-react'

const Movies = () => {
  const { shows } = useAppContext()
  const [filterQuery, setFilterQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')

  // Extract all unique genres from shows
  const genres = ['All', ...new Set((shows || []).flatMap(s => (s.genres || []).map(g => g.name)))]

  const filteredShows = (shows || []).filter(movie => {
    const matchesSearch = movie.title?.toLowerCase().includes(filterQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'All' || movie.genres?.some(g => g.name === selectedGenre)
    return matchesSearch && matchesGenre
  })

  return (
    <main className="relative pt-28 pb-20 px-6 md:px-16 lg:px-24 xl:px-36 overflow-hidden min-h-[85vh] max-w-7xl mx-auto">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            Cinema Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Now Showing</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Browse through active movies and book your seats instantly
          </p>
        </div>

        {/* Filter Input & Genre Select */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search title..."
              className="w-full bg-white/[0.05] border border-white/10 focus:border-primary/50 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-white placeholder-gray-400 outline-none transition"
            />
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-white/[0.05] border border-white/10 focus:border-primary/50 text-xs font-medium text-gray-200 rounded-full px-4 py-2 outline-none cursor-pointer transition"
          >
            {genres.map(genre => (
              <option key={genre} value={genre} className="bg-[#121216] text-white">
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Content */}
      {!shows ? (
        <MovieGridSkeleton count={8} />
      ) : filteredShows.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No Movies Match Your Criteria"
          description={
            filterQuery || selectedGenre !== 'All'
              ? `We couldn't find any movies matching "${filterQuery}" in ${selectedGenre}. Try clearing filters.`
              : 'There are currently no active movies available in the catalog.'
          }
          actionText={filterQuery || selectedGenre !== 'All' ? 'Reset Filters' : 'Explore Home'}
          onActionClick={() => {
            setFilterQuery('')
            setSelectedGenre('All')
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
          {filteredShows.map((movie) => (
            <MovieCard movie={movie} key={movie._id} />
          ))}
        </div>
      )}
    </main>
  )
}

export default Movies