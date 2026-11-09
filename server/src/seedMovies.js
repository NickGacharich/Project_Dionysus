require("dotenv").config({ path: require("path").resolve(__dirname, "../.env"), });

const mongoose = require("mongoose");
const connectDB = require("./config/database");
const Movie = require("./models/Movie");

const movies = [
  {
    title: "The Dark Knight",
    description: "Batman faces the Joker, a criminal mastermind determined to plunge Gotham into chaos.",
    releaseYear: 2008,
    genres: ["Action", "Crime", "Drama"],
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    videoUrl: "http://localhost:5000/videos/big-buck-bunny.mp4",
    rating: 9.0,
  },
  {
    title: "Inception",
    description: "A skilled thief enters people's dreams to steal secrets and attempt an impossible heist.",
    releaseYear: 2010,
    genres: ["Action", "Sci-Fi", "Thriller"],
    posterUrl: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    videoUrl: "http://localhost:5000/videos/big-buck-bunny.mp4",
    rating: 8.8,
  },
  {
    title: "Interstellar",
    description: "Explorers travel beyond Earth in search of a future for humanity.",
    releaseYear: 2014,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    videoUrl: "http://localhost:5000/videos/big-buck-bunny.mp4",
    rating: 8.7,
  },
  {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with the Fremen while pursuing revenge and confronting his destiny.",
    releaseYear: 2024,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    videoUrl: "http://localhost:5000/videos/big-buck-bunny.mp4",
    rating: 8.5,
  },
  {
    title: "The Batman",
    description: "Batman investigates corruption in Gotham while pursuing a mysterious serial killer.",
    releaseYear: 2022,
    genres: ["Action", "Crime", "Drama"],
    posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    videoUrl: "http://localhost:5000/videos/big-buck-bunny.mp4",
    rating: 7.8,
  },
  {
    title: "The Matrix",
    description: "A computer programmer discovers that reality is not what it seems.",
    releaseYear: 1999,
    genres: ["Action", "Sci-Fi"],
    posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    videoUrl: "http://localhost:5000/videos/big-buck-bunny.mp4",
    rating: 8.7,
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    description: "Miles Morales discovers a multiverse filled with different versions of Spider-Man.",
    releaseYear: 2018,
    genres: ["Animation", "Action", "Adventure"],
    posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    videoUrl: "http://localhost:5000/videos/big-buck-bunny.mp4",
    rating: 8.4,
  },
  {
    title: "Everything Everywhere All at Once",
    description: "An ordinary woman becomes responsible for saving multiple versions of the universe.",
    releaseYear: 2022,
    genres: ["Action", "Adventure", "Sci-Fi"],
    posterUrl: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    videoUrl: "http://localhost:5000/videos/big-buck-bunny.mp4",
    rating: 7.8,
  },
];

async function seedMovies() {
  try {
    await connectDB();

    for (const movie of movies) {
      await Movie.findOneAndUpdate(
        { title: movie.title },
        { $set: movie },
        { upsert: true, new: true, runValidators: true }
      );
    }

    console.log(`Successfully seeded ${movies.length} sample movies.`);
  } catch (error) {
    console.error("Movie seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedMovies();
