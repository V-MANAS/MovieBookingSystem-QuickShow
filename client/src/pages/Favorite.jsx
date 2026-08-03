import React from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import EmptyState from '../components/EmptyState'
import { MovieGridSkeleton } from '../components/Skeleton'
import { useAppContext } from '../context/AppContext'
import { Heart, Lock } from 'lucide-react'

const Favorite = () => {
  const { favoriteMovies } = useAppContext()
  const { user, isLoaded } = useUser()
  const { openSignIn } = useClerk()

  if (!isLoaded) {
    return <MovieGridSkeleton count={4} />
  }

  // Guidance for unauthenticated users
  if (!user) {
    return (
      <main className="relative pt-28 pb-20 px-6 md:px-16 lg:px-24 min-h-[80vh] max-w-4xl mx-auto flex items-center justify-center">
        <EmptyState
          icon={Lock}
          title="Sign In Required"
          description="Please sign in to access and manage your personal favorite movies watchlist."
          actionText="Sign In"
          onAction={openSignIn}
        />
      </main>
    )
  }

  return (
    <main className="relative pt-28 pb-20 px-6 md:px-16 lg:px-24 xl:px-36 overflow-hidden min-h-[85vh] max-w-7xl mx-auto">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10 mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
            <Heart className="w-4 h-4 text-primary fill-primary" />
            Personal Watchlist
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Your Favorite Movies</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Movies you have saved to your favorites collection
          </p>
        </div>

        {favoriteMovies && favoriteMovies.length > 0 && (
          <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            {favoriteMovies.length} Saved {favoriteMovies.length === 1 ? 'Movie' : 'Movies'}
          </div>
        )}
      </div>

      {/* Content */}
      {!favoriteMovies || favoriteMovies.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your Favorites List is Empty"
          description="Click the heart icon on any movie details page to save it to your personal favorites collection!"
          actionText="Explore Movies"
          actionLink="/movies"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
          {favoriteMovies.map((movie) => (
            <MovieCard movie={movie} key={movie._id} />
          ))}
        </div>
      )}
    </main>
  )
}

export default Favorite