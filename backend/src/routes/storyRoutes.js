import express from "express";
import {
  getStories,
  getSingleStory,
  toggleBookmark,
  getBookmarkedStories,
} from "../controllers/storyController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getStories);

router.get("/bookmarks", protect, getBookmarkedStories);

router.post("/:id/bookmark", protect, toggleBookmark);

router.get("/:id", getSingleStory);

export default router;
