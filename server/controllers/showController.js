import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { err } from "inngest/types";

// get now playing movies
// export const getNowPlayingMovies = async (req, res) => {
//   try {
//     const { data } = await axios.get(
//       "https://api.themoviedb.org/3/movie/now_playing",
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
//         },
//       }
//     );

//     res.json({ success: true, movies: data.results });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// add show
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    if (!movieId || !showsInput || !showPrice) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    let movie = await Movie.findById(movieId);

    // 🔹 Fetch from TMDB if not in DB
    if (!movie) {
      try {
        const movieRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
            timeout: 15000,
          }
        );

        const movieData = movieRes.data;

        movie = await Movie.create({
          _id: movieId,
          title: movieData.title,
          overview: movieData.overview,
          poster_path: movieData.poster_path,
          backdrop_path: movieData.backdrop_path,
          genres: movieData.genres,
          release_date: movieData.release_date,
          original_language: movieData.original_language,
          tagline: movieData.tagline || "",
          vote_average: movieData.vote_average,
          runtime: movieData.runtime,
        });

      } catch (tmdbError) {
        console.error("TMDB fetch failed:", tmdbError.message);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch movie data from TMDB. Turn ON VPN.",
        });
      }
    }

    // 🔹 Create shows
    const showToCreate = [];

    showsInput.forEach((show) => {
      show.time.forEach((time) => {
        const dateTimeString = `${show.date}T${time}`;

        showToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    await Show.insertMany(showToCreate);

    res.json({ success: true, message: "Show added successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



//api to    get all show from db
export const getShows = async(req,res)=>{
    try{
        const show = await Show.find({showDateTime:{$gte:new Date()}}).populate('movie').sort({showDateTime:1});

        //filter unique shows
        const uniqueShows = new Set(show.map(show=> show.movie))

        res.json({success:true,shows:Array.from(uniqueShows)})
    }catch(error){
        console.error(error);
        res.json({success:false, message:error.message});
    }
}

//api to single show fromdb
export const getShow = async (req, res) => {
  try {
    const movieId = req.params.movieId;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() }
    });

    const dateTime = {};
    shows.forEach(show => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id
      });
    });

    res.json({ success: true, movie, dateTime });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
