
const mongoose = require("mongoose");
const PlaybackProgress = require("../models/PlaybackProgress");

exports.getProgress = async (req, res) => {
  try {
    const progress = await PlaybackProgress.find({
      user: req.user.id,
      completed: false,
    })
      .populate("movie")
      .sort({ lastWatchedAt: -1 });

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Get progress error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve playback progress.",
    });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { currentTime, duration } = req.body;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID.",
      });
    }

    if (
      typeof currentTime !== "number" ||
      typeof duration !== "number" ||
      !Number.isFinite(currentTime) ||
      !Number.isFinite(duration) ||
      currentTime < 0 ||
      duration <= 0 ||
      currentTime > duration
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid playback position.",
      });
    }

    const completed =
      currentTime >= duration * 0.95;

    const progress = await PlaybackProgress.findOneAndUpdate(
      {
        user: req.user.id,
        movie: movieId,
      },
      {
        $set: {
          currentTime,
          duration,
          completed,
          lastWatchedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Save progress error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to save playback progress.",
    });
  }
};

exports.removeProgress = async (req, res) => {
    try {
      const { movieId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(movieId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid movie ID.",
        });
      }
  
      await PlaybackProgress.deleteOne({
        user: req.user.id,
        movie: movieId,
      });
  
      res.status(200).json({
        success: true,
        message: "Movie removed from Continue Watching.",
      });
    } catch (error) {
      console.error("Remove progress error:", error);
  
      res.status(500).json({
        success: false,
        message: "Unable to remove playback progress.",
      });
    }
  };
