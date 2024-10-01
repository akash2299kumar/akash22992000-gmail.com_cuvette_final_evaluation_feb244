const express = require('express');
const router = express.Router();
const { register, login,logoutUser, loadUser} = require('../controller/user.js');
const { bookmarkStory, getAllBookmarks } = require('../controller/bookmark.js');
const {isAuth} = require('../middleware/auth.js');

// auth routes 
router.post('/register', register);
router.post('/login', login);
router.post('/logout',logoutUser)
router.get('/load/:username',isAuth,loadUser)

// bookmark routes
router.post('/bookmark/:id', isAuth , bookmarkStory);
router.get('/bookmarks/:userId', isAuth , getAllBookmarks);

module.exports = router;

