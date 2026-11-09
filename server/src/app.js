
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const movieRoutes = require("./routes/movie.routes");
const watchlistRoutes = require("./routes/watchlist.routes");
const progressRoutes = require("./routes/progress.routes");
const path = require("path");

const app = express();

// Allow requests from the Angular frontend.
const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Parse incoming JSON request bodies.
app.use(express.json({ limit: "10kb" }));

// Log incoming requests during development.
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// Health check.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dionysus API is running!",
  });
});

// Authentication routes.
app.use("/api/auth", authRoutes);

// Watchlist routes.
app.use("/api/watchlist", watchlistRoutes);

// Movie routes.
app.use("/api/movies", movieRoutes);

// Movie progress routes.
app.use("/api/progress", progressRoutes);

app.use(
  "/videos",
  express.static(path.join(__dirname, "../public/videos"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Handle unexpected errors.
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
  });
});

module.exports = app;