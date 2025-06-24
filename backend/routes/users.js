const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const authOptional = require('../middleware/authOptional');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// @route   GET /api/users/search
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
    .select('username email avatar bio followers following')
    .skip(skip)
    .limit(parseInt(limit));

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:username
router.get('/:username', authOptional, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('posts', 'title images likes createdAt')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let isFollowing = false;
    if (req.user && user.followers.some(f => f.equals(req.user.id))) {
      isFollowing = true;
    }

    const stats = {
      postsCount: user.posts.length,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      totalLikes: await Post.aggregate([
        { $match: { author: user._id } },
        { $project: { likesCount: { $size: '$likes' } } },
        { $group: { _id: null, total: { $sum: '$likesCount' } } }
      ]).then(result => result[0]?.total || 0)
    };

    // Incluye isFollowing en el objeto user
    const userObj = user.toObject();
    userObj.isFollowing = isFollowing;

    res.json({
      user: userObj,
      stats
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
router.put('/profile', auth, [
  body('username').optional().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, bio } = req.body;
    const updateData = {};

    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      updateData.username = username;
    }

    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/avatar
router.put('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No avatar file provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Avatar updated successfully',
      avatar: req.file.path,
      user
    });

  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/follow
router.put('/:id/follow', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? 'User unfollowed' : 'User followed',
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length
    });

  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:username/posts
router.get('/:username/posts', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ 
      author: user._id,
      isPublic: true 
    })
    .populate('author', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Post.countDocuments({ 
      author: user._id,
      isPublic: true 
    });

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/bulk
// @desc    Get user info for an array of user IDs
router.post('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No user IDs provided' });
    }
    const users = await User.find({ _id: { $in: ids } })
      .select('_id username avatar');
    res.json({ users });
  } catch (error) {
    console.error('Bulk user fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
