
const mongoose = require("mongoose");

const playbackProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    currentTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Each user gets one progress record per movie.
playbackProgressSchema.index(
  { user: 1, movie: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "PlaybackProgress",
  playbackProgressSchema
);
