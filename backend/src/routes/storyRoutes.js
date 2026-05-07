import express from "express";
import {
  getStories,
  getSingleStory,
  toggleBookmark,
} from "../controllers/storyController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getStories);

router.get("/:id", getSingleStory);

router.post("/:id/bookmark", protect, toggleBookmark);

export default router;