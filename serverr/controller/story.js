const Story = require("../model/storyModel");
const User = require("../model/userModel");
const errorHandler = require("../middleware/errorHandler");

const getMediaType = (url) => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;

  // Strip query parameters (everything after '?')
  const urlWithoutQuery = url.split('?')[0];
  
  // Get the file extension after the last dot (.)
  const extension = urlWithoutQuery.split('.').pop().toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    return 'image';
  } else if (['mp4', 'avi', 'mov', 'webm'].includes(extension)) {
    return 'video';
  }

  // Check if it's a YouTube video
  if (youtubeRegex.test(url)) {
    return 'video';
  }

  return 'unknown';
};

const createStory = async (req, res, next) => {
  try {
    const { slides, addedBy } = req.body;
    if (!slides || !addedBy) {
      return res.status(400).json("Please provide all the required fields");
    }

    // Validate and set mediaType for each slide
    const validatedSlides = slides.map(slide => {
      const mediaType = getMediaType(slide.imageUrl);
      if (mediaType === 'unknown') {
        throw new Error(`Invalid media URL: ${slide.imageUrl}`);
      }
      return { ...slide, mediaType }; // Add mediaType to slide
    });

    const story = new Story({ slides: validatedSlides, addedBy });
    await story.save();
    res.status(201).json({ success: true, story });
  } catch (error) {
    next(new Error("Error creating story: " + error.message));
  }
};

const updateStory = async (req, res, next) => {
  try {
    const { slides, addedBy } = req.body;

    if (!slides || !addedBy) {
      return res.status(400).json("Please provide all the required fields");
    }

    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    // Validate and set mediaType for each slide
    const validatedSlides = slides.map(slide => {
      const mediaType = getMediaType(slide.mediaUrl);
      if (mediaType === 'unknown') {
        throw new Error(`Invalid media URL: ${slide.mediaUrl}`);
      }
      return { ...slide, mediaType }; // Add mediaType to slide
    });

    // Update the story
    story.slides = validatedSlides;
    story.addedBy = addedBy;
    await story.save();
    res.status(200).json({ success: true, story });
  } catch (error) {
    next(new Error("Error updating story: " + error.message));
  }
};

const getStories = async (req, res, n) => {
  const categories = ["food", "health and fitness", "travel", "movie", "education"];
  const { userId, category, catLimit, cat } = req.query;

  let page = parseInt(req.query.page) || 1;
  let limit = 4 * page;
  let skip = 0;

  try {
    let stories = [];

    if (userId) {
      stories = await Story.find({ addedBy: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else if (category && category.toLowerCase() === "all") {
      const groupedStories = {};
      for (const c of categories) {
        const categoryStories = await Story.find({
          slides: { $elemMatch: { category: c } },
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(cat === c ? catLimit : 4);
        groupedStories[c] = categoryStories;
      }
      return res.status(200).json({ success: true, stories: groupedStories, page });
    } else {
      stories = await Story.find({
        slides: { $elemMatch: { category: category } },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      return res.status(200).json({ success: true, stories, page });
    }

    res.status(200).json({ success: true, stories, page });
  } catch (error) {
    next(new Error("Error getting stories"));
  }
};

const getStoryById = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { userId } = req.query;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    let totalLikes = story.likes.length;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const liked = user.likes.includes(storyId);
        const bookmarked = user.bookmarks.includes(storyId);

        return res.status(200).json({
          success: true,
          story,
          liked,
          bookmarked,
          totalLikes,
        });
      }
    } else {
      return res.status(200).json({ success: true, story, totalLikes });
    }
  } catch (error) {
    console.log(error);
    next(new Error("Error getting story"));
  }
};

module.exports = {
  createStory,
  getStories,
  getStoryById,
  updateStory,
};
