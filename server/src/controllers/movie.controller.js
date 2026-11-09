
const Movie = require("../models/Movie");

// GET /api/movies
exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find().sort({ title: 1 });

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/:id
exports.getMovieById = async (req, res, next) => {
  try {
    const mongoose = require("mongoose");
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID.",
      });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    next(error);
  }
};
