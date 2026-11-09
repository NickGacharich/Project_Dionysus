
const mongoose = require("mongoose");
const User = require("../models/User");
const Movie = require("../models/Movie");

// GET /api/watchlist
// Return the signed-in user's saved movies.
exports.getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("watchlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/watchlist/:movieId
// Add a movie to the signed-in user's list.
exports.addToWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID.",
      });
    }

    const movieExists = await Movie.exists({ _id: movieId });

    if (!movieExists) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { watchlist: movieId } },
      { new: true }
    ).populate("watchlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie added to My List.",
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/watchlist/:movieId
// Remove a movie from the signed-in user's list.
exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { watchlist: movieId } },
      { new: true }
    ).populate("watchlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie removed from My List.",
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};
