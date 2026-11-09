
const express = require("express");
const movieController = require("../controllers/movie.controller");

const router = express.Router();

router.get("/", movieController.getMovies);
router.get("/:id", movieController.getMovieById);

module.exports = router;
