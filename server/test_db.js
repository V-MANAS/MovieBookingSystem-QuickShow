import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({path: "./.env"});

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Show = (await import("./models/Show.js")).default;
    const Movie = (await import("./models/Movie.js")).default;
    
    const count = await Movie.countDocuments();
    console.log("Total movies in DB:", count);

    const lilo = await Movie.findOne({title: /Lilo/i});
    console.log("Lilo movie found:", lilo ? lilo._id : false);

    if (lilo) {
        const shows = await Show.find({movie: lilo._id});
        console.log("Shows for Lilo:", shows.length);
        const futureShows = await Show.find({movie: lilo._id, showDateTime: {$gte: new Date()}});
        console.log("Future shows for Lilo:", futureShows.length);
    }
    
    process.exit(0);
}).catch(console.error);
