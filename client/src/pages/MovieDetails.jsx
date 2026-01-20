import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/dateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MovieDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [show, setShow] = useState({
    movie: null,
    dateTime: {},
    casts: []   // 👈 IMPORTANT: Always start with empty array
  })

  const { shows, axios, getToken, user, fetchFavoriteMovies, favoriteMovies, image_base_url } = useAppContext()

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if (data.success) {
        setShow({
          movie: data.movie,
          dateTime: data.dateTime,
          casts: data.casts || []   // 👈 SAFE FALLBACK
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
  }, [id])

  if (!show.movie) return <Loading />

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>

      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img
          src={image_base_url + show.movie.poster_path}
          alt=''
          className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover'
        />

        <div className='relative flex flex-col gap-3'>
          <BlurCircle top='-100px' left='-100px' />
          <p className='text-primary'>ENGLISH</p>

          <h1 className='text-4xl font-semibold max-w-96 text-balance'>
            {show.movie.title}
          </h1>

          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-primary fill-primary' />
            {show.movie.vote_average.toFixed(1)} User Ratings
          </div>

          <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>
            {show.movie.overview}
          </p>

          <p>
            {timeFormat(show.movie.runtime)} ●
            {show.movie.genres.map(g => g.name).join(", ")} ●
            {show.movie.release_date.split("-")[0]}
          </p>

          <div className='flex flex-wrap gap-4 mt-4'>
            <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md'>
              <PlayCircleIcon className='w-5 h-5' />
              Watch Trailer
            </button>

            <a href='#dateSelect' className='px-10 py-3 text-sm bg-primary rounded-md'>
              Buy Tickets
            </a>

            <button onClick={handleFavorite} className='bg-gray-700 p-2.5 rounded-full'>
              <Heart className={`w-5 h-5 ${favoriteMovies.find(m => m._id === id) ? 'fill-primary text-primary' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 CAST SECTION – FIX STARTS HERE */}
      <p className='text-lg font-medium mt-20'>Cast</p>

      <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
        <div className='flex items-center gap-4 w-max px-4'>

          {show.casts.length > 0 ? (
            show.casts.map((cast, index) => (
              <div key={index} className='flex flex-col items-center text-center'>
                <img
                  src={image_base_url + cast.profile_path}
                  alt={cast.name}
                  className='rounded-full h-20 aspect-square object-cover'
                />
                <p className='font-medium text-xs mt-3'>{cast.name}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">Cast information not available</p>
          )}

        </div>
      </div>

      <DateSelect dateTime={show.dateTime} id={id} />

      <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>

      <div className='flex flex-wrap gap-8'>
        {shows.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      <div className='flex justify-center mt-20'>
        <button onClick={() => { navigate('/movies'); scrollTo(0, 0) }}
          className='px-10 py-3 bg-primary rounded-md'>
          Show more
        </button>
      </div>

    </div>
  )
}

export default MovieDetails
