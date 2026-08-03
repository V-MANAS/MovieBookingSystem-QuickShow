import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';

dotenv.config();

const updateTrailers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const movies = await Movie.find();
    console.log(`Found ${movies.length} movies in DB.`);

    const trailerMap = {
      'Avatar: Fire and Ash': 'https://youtu.be/WpW36ldAqnM',
      'The Rip': 'https://youtu.be/-sAOWhvheK8',
      'The Housemaid': 'https://youtu.be/1pHDWnXmK7Y',
      'People We Meet on Vacation': 'https://youtu.be/umiKiW4En9g',
    };

    for (const m of movies) {
      if (!m.trailerUrl) {
        m.trailerUrl = trailerMap[m.title] || 'https://youtu.be/WpW36ldAqnM';
        await m.save();
        console.log(`Updated trailerUrl for movie "${m.title}": ${m.trailerUrl}`);
      }
    }

    console.log("All movies updated with trailer URLs.");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error updating trailers:", err);
  }
};

updateTrailers();
