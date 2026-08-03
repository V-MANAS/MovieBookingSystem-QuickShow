import React, { useState, useEffect } from 'react'
import BlurCircle from './BlurCircle'
import { PlayCircle, Film, AlertCircle, Loader2 } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { getYouTubeVideoId } from '../lib/youtube'

const TrailerSection = () => {
  const { shows, image_base_url } = useAppContext()
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Deduplicate and filter movies dynamically from current database shows catalog
  const movieMap = new Map()
  if (Array.isArray(shows)) {
    shows.forEach((item) => {
      const movie = item.movie ? item.movie : (item._id && item.title ? item : null)
      if (movie && movie._id && !movieMap.has(movie._id)) {
        movieMap.set(movie._id, movie)
      }
    })
  }

  const moviesList = Array.from(movieMap.values())

  // Set default selected movie when catalog loads/updates
  useEffect(() => {
    if (moviesList.length > 0) {
      if (!selectedMovie || !moviesList.find(m => m._id === selectedMovie._id)) {
        setSelectedMovie(moviesList[0])
      }
    } else {
      setSelectedMovie(null)
    }
  }, [shows])

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie)
    setIsLoading(true)
  }

  // Extract explicit YouTube video ID without title searching
  const rawUrl = selectedMovie?.trailerUrl || selectedMovie?.videoUrl || selectedMovie?.trailer_url
  const videoId = getYouTubeVideoId(rawUrl)

  // Construct dynamic poster image URL
  const getPosterUrl = (movie) => {
    if (!movie?.poster_path) return '/backgroundImage.png'
    return movie.poster_path.startsWith('http')
      ? movie.poster_path
      : image_base_url + movie.poster_path
  }

  return (
    <section className="relative px-6 md:px-16 lg:px-24 xl:px-36 py-16 overflow-hidden max-w-7xl mx-auto">
      <BlurCircle top="-100px" right="-100px" />

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Official Trailers</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Watch exclusive previews of current blockbusters in theaters</p>
          </div>
        </div>
      </div>

      {/* Main Video Frame */}
      <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden bg-gray-950 border border-white/15 shadow-2xl shadow-black/80">
        <div className="aspect-video w-full relative flex items-center justify-center">
          {videoId ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950/90 text-gray-400 gap-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-xs font-semibold">Loading Trailer...</span>
                </div>
              )}
              <iframe
                className="w-full h-full rounded-2xl"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                title={selectedMovie?.title ? `${selectedMovie.title} Trailer` : 'Movie Trailer'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white/[0.02]">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Trailer Not Available</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                No official video trailer URL is configured for "{selectedMovie?.title || 'Selected Movie'}".
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Movie Poster Thumbnails Strip */}
      {moviesList.length > 0 ? (
        <div className="mt-10 max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
            Select Movie Trailer ({moviesList.length})
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {moviesList.map((movie) => {
              const isSelected = selectedMovie?._id === movie._id
              const posterUrl = getPosterUrl(movie)

              return (
                <div
                  key={movie._id}
                  onClick={() => handleSelectMovie(movie)}
                  className="flex flex-col group cursor-pointer"
                >
                  <div
                    className={`relative rounded-xl overflow-hidden aspect-[2/3] w-full border transition-all duration-300 ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-xl shadow-primary/25'
                        : 'border-white/10 opacity-75 hover:opacity-100 hover:scale-102 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition duration-300"
                    />

                    {/* Play Overlay Icon */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                      <PlayCircle
                        className={`w-9 h-9 transition-transform duration-300 ${
                          isSelected ? 'text-primary scale-110 fill-primary/20' : 'text-white/80 group-hover:scale-110'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Movie Title Beneath Thumbnail */}
                  <p className={`text-xs font-bold mt-2 text-center truncate transition ${
                    isSelected ? 'text-primary' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {movie.title}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center text-xs text-gray-500">
          No movies currently scheduled in the database.
        </div>
      )}
    </section>
  )
}

export default TrailerSection
