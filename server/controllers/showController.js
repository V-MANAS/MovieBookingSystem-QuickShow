import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// get now playing movies (recent releases from database)
export const getNowPlayingMovies = async (req, res) => {
  try {
    const movies = await Movie.find({}).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// add show
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice, trailerUrl } = req.body;

    if (!movieId || !showsInput || !showPrice) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    let movie = await Movie.findById(movieId);

    // 🔹 Fetch from OMDb if not in DB
    if (!movie) {
      try {
        const movieRes = await axios.get(
          `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${movieId}&plot=full`,
          {
            timeout: 15000,
          }
        );

        const movieData = movieRes.data;
        if (movieData.Response === "False") {
          throw new Error("Movie not found in OMDb");
        }

        movie = await Movie.create({
          _id: movieId,
          title: movieData.Title,
          overview: movieData.Plot,
          poster_path: movieData.Poster !== "N/A" ? movieData.Poster : "",
          backdrop_path: movieData.Poster !== "N/A" ? movieData.Poster : "",
          genres: movieData.Genre ? movieData.Genre.split(', ').map(g => ({ name: g })) : [],
          release_date: movieData.Released !== "N/A" ? movieData.Released : "Unknown",
          original_language: movieData.Language,
          tagline: "",
          vote_average: parseFloat(movieData.imdbRating) || 0,
          runtime: parseInt(movieData.Runtime) || 120,
          casts: movieData.Actors ? movieData.Actors.split(', ').map(a => ({ name: a, character: "", profile_path: "" })) : [],
          trailerUrl: trailerUrl || ""
        });

      } catch (omdbError) {
        console.error("OMDb fetch failed:", omdbError.message);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch movie data from OMDb.",
        });
      }
    } else if (trailerUrl) {
      movie.trailerUrl = trailerUrl;
      await movie.save();
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

// delete show
export const deleteShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const deletedShow = await Show.findByIdAndDelete(showId);
    if (!deletedShow) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }
    res.json({ success: true, message: "Show deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to get all show from db
export const getShows = async (req, res) => {
  try {
    const show = await Show.find({}).populate('movie').sort({ showDateTime: 1 });
    const uniqueShows = new Set(show.map(show => show.movie))
    res.json({ success: true, shows: Array.from(uniqueShows) })
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}

// api to single show from db
export const getShow = async (req, res) => {
  try {
    const movieId = req.params.movieId;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const shows = await Show.find({
      movie: movieId
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

    let casts = movie.casts || [];
    if (casts.length === 0 && movieId) {
      try {
        const omdbRes = await axios.get(
          `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${movieId}&plot=full`,
          { timeout: 8000 }
        );
        const omdbData = omdbRes.data;
        if (omdbData.Response !== "False" && omdbData.Actors) {
          casts = omdbData.Actors.split(', ').map(a => ({
            name: a,
            character: "",
            profile_path: ""
          }));
          movie.casts = casts;
          await movie.save();
        }
      } catch (omdbErr) {
        console.warn("OMDb cast fetch failed:", omdbErr.message);
      }
    }

    res.json({ success: true, movie, dateTime, casts });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find({}).sort({ createdAt: -1 });
    res.json({ success: true, movies, shows: movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
