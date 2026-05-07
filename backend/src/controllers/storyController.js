import Story from "../models/Story.js";
import User from "../models/User.js";

// @desc Get all stories
// @route GET /api/stories
export const getStories = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const stories = await Story.find()
      .sort({ points: -1 })
      .skip(skip)
      .limit(limit);

    const totalStories = await Story.countDocuments();

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalStories / limit),
      totalStories,
      count: stories.length,
      stories,
    });
  } catch (error) {
    console.error("Get Stories Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stories",
    });
  }
};

// @desc Get single story
// @route GET /api/stories/:id
export const getSingleStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    res.status(200).json({
      success: true,
      story,
    });
  } catch (error) {
    console.error("Get Story Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch story",
    });
  }
};

// @desc Toggle bookmark
// @route POST /api/stories/:id/bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const storyId = req.params.id;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyBookmarked = user.bookmarks.includes(storyId);

    if (alreadyBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== storyId
      );
    } else {
      user.bookmarks.push(storyId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: alreadyBookmarked
        ? "Bookmark removed"
        : "Story bookmarked",
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    console.error("Bookmark Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to toggle bookmark",
    });
  }
};

export const getBookmarkedStories = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("bookmarks");

    res.json({
      success: true,
      stories: user.bookmarks,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};