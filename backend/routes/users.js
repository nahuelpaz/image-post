const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const authOptional = require('../middleware/authOptional');
const { upload } = require('../config/cloudinary');
const cloudinary = require('cloudinary').v2;
const { createNotification, generateNotificationMessage } = require('../utils/notifications');

const router = express.Router();

// @route   GET /api/users/search
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const skip = (page - 1) * limit;
    
    // Busca usuarios y también cuenta los posts públicos de cada uno
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
    .select('username email avatar bio followers following posts')
    .skip(skip)
    .limit(parseInt(limit));

    // Para cada usuario, cuenta los posts públicos y agrega postsCount
    const usersWithPostsCount = await Promise.all(users.map(async user => {
      const postsCount = await Post.countDocuments({ author: user._id, isPublic: true });
      return {
        ...user.toObject(),
        followersCount: user.followers.length,
        postsCount
      };
    }));

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    });

    res.json({
      users: usersWithPostsCount,
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
      
      // Crear notificación de follow
      await createNotification({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'follow',
        message: generateNotificationMessage('follow', req.user.username)
      });
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
      .select('_id username avatar bio');

    res.json({ users });
  } catch (error) {
    console.error('Bulk user fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account (soft delete)
router.delete('/account', auth, [
  body('password').notEmpty().withMessage('Password is required to delete account')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { password } = req.body;

    // Primero obtener los datos del usuario CON la contraseña para verificar
    const currentUser = await User.findById(userId).select('+password');
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verificar la contraseña
    const isMatch = await currentUser.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    // Hard delete: eliminar completamente el usuario y sus datos
    
    // 1. Obtener todos los posts del usuario
    const userPosts = await Post.find({ author: userId });
    
    // 2. Eliminar las imágenes de Cloudinary
    for (const post of userPosts) {
      if (post.images && post.images.length > 0) {
        for (const image of post.images) {
          try {
            // Extraer public_id de la URL de Cloudinary
            const publicId = image.public_id || image.url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`imagepost/${publicId}`);
            console.log(`Deleted image: ${publicId}`);
          } catch (error) {
            console.error(`Error deleting image: ${error.message}`);
          }
        }
      }
    }
    
    // 3. Eliminar todos los posts
    await Post.deleteMany({ author: userId });
    
    // 4. Eliminar el usuario de las listas de following/followers de otros usuarios
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    
    // 5. Eliminar comentarios del usuario en otros posts
    await Post.updateMany(
      {},
      { $pull: { comments: { author: userId } } }
    );
    
    // 6. Eliminar likes del usuario en otros posts
    await Post.updateMany(
      {},
      { $pull: { likes: userId } }
    );
    
    // 7. Finalmente eliminar el usuario
    await User.findByIdAndDelete(userId);

    res.json({
      message: 'Account and all associated data deleted successfully',
      user: null
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/change-email
// @desc    Change user email
router.put('/change-email', auth, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required to change email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    // Update email
    user.email = email;
    await user.save();

    res.json({
      message: 'Email changed successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/settings/notifications
// @desc    Get user's notification settings
router.get('/settings/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationSettings');
    
    res.json({
      notificationSettings: user.notificationSettings || {
        likes: true,
        comments: true,
        follows: true
      }
    });

  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/settings/notifications
// @desc    Update user's notification settings
router.put('/settings/notifications', auth, async (req, res) => {
  try {
    const { likes, comments, follows } = req.body;
    
    const updateData = {
      'notificationSettings.likes': likes,
      'notificationSettings.comments': comments,
      'notificationSettings.follows': follows
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('notificationSettings');

    res.json({
      message: 'Notification settings updated successfully',
      notificationSettings: user.notificationSettings
    });

  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
