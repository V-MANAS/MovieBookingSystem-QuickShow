import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircle, Star, Clock, Calendar, Globe, Sparkles, User, ArrowLeft } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import { MovieDetailsSkeleton } from '../components/Skeleton'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MovieDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [show, setShow] = useState({
    movie: null,
    dateTime: {},
    casts: []
  })

  const { shows, axios, getToken, user, fetchFavoriteMovies, favoriteMovies, image_base_url } = useAppContext()

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if (data.success) {
        setShow({
          movie: data.movie,
          dateTime: data.dateTime,
          casts: data.casts || []
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleFavorite = async () => {
    try {
      if (!user) return toast.error('Please login to proceed')

      const { data } = await axios.post(
        '/api/user/update-favorite',
        { movieId: id },
        { headers: { authorization: `Bearer ${await getToken()}` } }
      )

      if (data.success) {
        await fetchFavoriteMovies()
        toast.success(data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getShow()
    window.scrollTo(0, 0)
  }, [id])

  if (!show.movie) return <MovieDetailsSkeleton />

  const isFavorited = favoriteMovies?.some(m => m._id === id)
  const posterUrl = show.movie.poster_path?.startsWith('http')
    ? show.movie.poster_path
    : image_base_url + show.movie.poster_path

  const backdropUrl = show.movie.backdrop_path
    ? (show.movie.backdrop_path.startsWith('http') ? show.movie.backdrop_path : image_base_url + show.movie.backdrop_path)
    : posterUrl

  const releaseYear = show.movie.release_date ? show.movie.release_date.split('-')[0] : '2024'

  return (
    <main className="relative min-h-screen bg-[#09090B] pb-20">
      {/* Hero Backdrop Glow Banner */}
      <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden">
        <img
          src={backdropUrl}
          alt={show.movie.title}
          className="w-full h-full object-cover object-top opacity-30 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-transparent to-[#09090B]" />
      </div>

      {/* Main Details Container Overlay */}
      <div className="relative z-10 -mt-64 md:-mt-80 max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-gray-200 backdrop-blur-md transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Movie Poster Card */}
          <div className="w-full md:w-72 lg:w-80 shrink-0 mx-auto md:mx-0">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/90 group">
              <img
                src={posterUrl}
                alt={show.movie.title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/75 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-amber-400 shadow-xl">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{show.movie.vote_average ? show.movie.vote_average.toFixed(1) : '8.0'}</span>
              </div>
            </div>
          </div>

          {/* Movie Information Panel */}
          <div className="flex-1 flex flex-col items-start gap-4">
            <BlurCircle top="-100px" left="-100px" />

            {/* Language & Genre Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider">
                English
              </span>
              {show.movie.genres?.map(g => (
                <span
                  key={g.name}
                  className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-300 text-xs font-medium backdrop-blur-md"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Movie Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {show.movie.title}
            </h1>

            {/* Quick Metadata Strip */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">{show.movie.vote_average?.toFixed(1)}</span> User Rating
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {timeFormat(show.movie.runtime)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {releaseYear}
              </span>
            </div>

            {/* Movie Overview */}
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mt-1">
              {show.movie.overview}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <a
                href="#dateSelect"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-dull text-white text-sm font-bold rounded-full shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Book Tickets
              </a>

              <button
                onClick={handleFavorite}
                className={`p-3.5 rounded-full border transition-all duration-200 cursor-pointer ${
                  isFavorited
                    ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20'
                    : 'bg-white/10 border-white/15 text-gray-300 hover:text-white hover:bg-white/20'
                }`}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-primary text-primary' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        <section className="mt-16 pt-10 border-t border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-2xl font-bold text-white">Cast & Crew</h3>
          </div>

          <div className="overflow-x-auto no-scrollbar pb-4">
            <div className="flex items-center gap-6 w-max py-2">
              {show.casts && show.casts.length > 0 ? (
                show.casts.map((cast, index) => {
                  const avatarSrc = cast.profile_path
                    ? (cast.profile_path.startsWith('http') ? cast.profile_path : image_base_url + cast.profile_path)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(cast.name)}&background=1f1f27&color=F84565&bold=true`

                  return (
                    <div key={index} className="flex flex-col items-center text-center w-24 group">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary transition duration-300 shadow-lg">
                        <img
                          src={avatarSrc}
                          alt={cast.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>
                      <p className="font-semibold text-xs text-white mt-2.5 line-clamp-1 w-full">{cast.name}</p>
                      {cast.character && (
                        <p className="text-gray-400 text-[11px] mt-0.5 truncate w-full font-medium">{cast.character}</p>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-400 text-sm">Cast information not currently available.</p>
              )}
            </div>
          </div>
        </section>

        {/* Date Selector Component */}
        <DateSelect dateTime={show.dateTime} id={id} />

        {/* You May Also Like Section */}
        <section className="mt-16 pt-10 border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white">You May Also Like</h3>
              <p className="text-xs text-gray-400 font-medium">Recommended movies based on your interest</p>
            </div>
            <button
              onClick={() => {
                navigate('/movies')
                window.scrollTo(0, 0)
              }}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              View Catalog →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
            {shows
              .filter(m => m._id !== id)
              .slice(0, 4)
              .map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default MovieDetails
