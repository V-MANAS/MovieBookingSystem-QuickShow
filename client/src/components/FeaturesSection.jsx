import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Flame, Film } from 'lucide-react'
import BlurCircle from './BlurCircle'
import MovieCard from './MovieCard'
import { MovieGridSkeleton } from './Skeleton'
import EmptyState from './EmptyState'
import { useAppContext } from '../context/AppContext'

const FeaturesSection = () => {
  const navigate = useNavigate()
  const { shows } = useAppContext()

  const displayedShows = (shows || []).slice(0, 4)

  return (
    <section className="relative px-6 md:px-16 lg:px-24 xl:px-36 py-16 overflow-hidden max-w-7xl mx-auto">
      <BlurCircle top="0" right="-80px" />

      {/* Section Header */}
      <div className="relative flex items-center justify-between pb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Now Showing</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Explore blockbusters in theaters near you</p>
          </div>
        </div>

        <button
          onClick={() => {
            navigate('/movies')
            window.scrollTo(0, 0)
          }}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-primary transition cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Movie Grid or Loading / Empty */}
      <div className="mt-10">
        {!shows ? (
          <MovieGridSkeleton count={4} />
        ) : displayedShows.length === 0 ? (
          <EmptyState
            icon={Film}
            title="No Shows Currently Active"
            description="Check back soon for upcoming movie listings and showtimes."
            actionText="Browse Releases"
            actionLink="/releases"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
            {displayedShows.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA Button */}
      {displayedShows.length > 0 && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => {
              navigate('/movies')
              window.scrollTo(0, 0)
            }}
            className="px-8 py-3 text-sm font-semibold bg-white/5 hover:bg-primary border border-white/15 hover:border-primary text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explore All Movies
          </button>
        </div>
      )}
    </section>
  )
}

export default FeaturesSection