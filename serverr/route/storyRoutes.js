const express = require("express");
const router = express.Router();
const { isAuth } = require("../middleware/auth.js");
const {
  createStory,
  getStories,
  getStoryById,
  updateStory,
} = require("../controller/story.js");
const { likeStory } = require("../controller/like.js");


// routes
router.post("/create", isAuth, createStory);
router.get("/getAll", getStories);
router.get("/getById/:storyId", getStoryById);
router.put("/update/:id", isAuth, updateStory);
router.put("/like/:id", isAuth, likeStory);

module.exports = router;