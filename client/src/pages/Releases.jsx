import React, { useEffect, useState } from 'react'
import axios from 'axios'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { MovieGridSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import toast from 'react-hot-toast'
import { Clapperboard, Sparkles, Search } from 'lucide-react'

const Releases = () => {
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const { data } = await axios.get('/api/show/releases')
        if (data.success) {
          setMovies(data.movies || [])
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReleases()
  }, [])

  const filteredMovies = movies.filter(movie =>
    movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="relative pt-28 pb-20 px-6 md:px-16 lg:px-24 xl:px-36 overflow-hidden min-h-[85vh] max-w-7xl mx-auto">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            Premiere Calendar
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">All Releases</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Discover all upcoming releases and recently premiered blockbusters
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search releases..."
            className="w-full bg-white/[0.05] border border-white/10 focus:border-primary/50 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-white placeholder-gray-400 outline-none transition"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <MovieGridSkeleton count={8} />
      ) : filteredMovies.length === 0 ? (
        <EmptyState
          icon={Clapperboard}
          title="No Releases Found"
          description={
            searchQuery
              ? `No releases match your search query "${searchQuery}".`
              : 'There are currently no new releases available.'
          }
          actionText={searchQuery ? 'Clear Search' : 'View Now Showing'}
          onActionClick={() => {
            if (searchQuery) setSearchQuery('')
          }}
          actionLink={searchQuery ? null : '/movies'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
          {filteredMovies.map((movie) => (
            <MovieCard movie={movie} key={movie._id} />
          ))}
        </div>
      )}
    </main>
  )
}

export default Releases
