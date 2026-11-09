
const express = require("express");
const router = express.Router();

const progressController = require("../controllers/progress.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get("/", progressController.getProgress);
router.put("/:movieId", progressController.saveProgress);
router.delete("/:movieId", progressController.removeProgress);

module.exports = router;
