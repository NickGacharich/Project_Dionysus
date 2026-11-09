
const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const watchlistController = require("../controllers/watchlist.controller");

const router = express.Router();

// Every watchlist endpoint requires a valid login token.
router.use(authenticate);

router.get("/", watchlistController.getWatchlist);
router.post("/:movieId", watchlistController.addToWatchlist);
router.delete("/:movieId", watchlistController.removeFromWatchlist);

module.exports = router;
