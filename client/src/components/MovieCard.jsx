import React from 'react'
import { Star, Ticket, Clock, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'
import { useAppContext } from '../context/AppContext'

const MovieCard = ({ movie }) => {
  const navigate = useNavigate()
  const { image_base_url } = useAppContext()

  if (!movie) return null

  const imagePath = movie.backdrop_path || movie.poster_path
  const fullImageUrl = imagePath
    ? (imagePath.startsWith('http') ? imagePath : image_base_url + imagePath)
    : '/backgroundImage.png'

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '2024'
  const genresList = movie.genres && movie.genres.length > 0
    ? movie.genres.slice(0, 2).map(g => g.name).join(' • ')
    : 'Cinema'

  const handleNavigate = () => {
    navigate(`/movies/${movie._id}`)
    window.scrollTo(0, 0)
  }

  return (
    <div 
      className="group relative flex flex-col justify-between bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-primary/40 rounded-2xl p-3.5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 w-full max-w-[270px] overflow-hidden"
    >
      {/* Poster Image Container */}
      <div 
        onClick={handleNavigate}
        className="relative rounded-xl overflow-hidden aspect-[2/3] w-full cursor-pointer bg-gray-900"
      >
        <img
          src={fullImageUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Dark Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Rating Badge Overlay */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{movie.vote_average ? movie.vote_average.toFixed(1) : '8.0'}</span>
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-xl shadow-primary/50 group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Section */}
      <div className="flex flex-col flex-1 justify-between mt-3.5">
        <div>
          <h3 
            onClick={handleNavigate}
            className="font-bold text-base text-white hover:text-primary transition line-clamp-1 cursor-pointer"
            title={movie.title}
          >
            {movie.title}
          </h3>

          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 line-clamp-1 font-medium">
            <span>{releaseYear}</span>
            <span>•</span>
            <span>{genresList}</span>
            {movie.runtime && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {timeFormat(movie.runtime)}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Card Footer / Action */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <button
            onClick={handleNavigate}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-dull text-white rounded-xl shadow-md shadow-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Book Tickets</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MovieCard