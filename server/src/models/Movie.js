const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        releaseYear: {
            type: Number,
            required: true
        },

        genres: [{
            type: String
        }],

        posterUrl: {
            type: String
        },

        backdropUrl: {
            type: String
        },

        videoUrl: {
            type: String,
            default: '',
        },
        trailerUrl: {
            type: String
        },

        rating: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Movie", movieSchema);