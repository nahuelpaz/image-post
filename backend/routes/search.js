const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/search/posts
router.get('/posts', async (req, res) => {
  try {
    const { q, tags, author, page = 1, limit = 20, sortBy = 'createdAt' } = req.query;
    
    if (!q && !tags && !author) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const skip = (page - 1) * limit;
    let query = { isPublic: true };
    
    const searchConditions = [];
    
    if (q) {
      searchConditions.push(
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      );
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      searchConditions.push({ tags: { $in: tagArray } });
    }

    if (author) {
      const authorUser = await User.findOne({ username: author });
      if (authorUser) {
        query.author = authorUser._id;
      } else {
        return res.json({ posts: [], pagination: { page: 1, limit, total: 0, pages: 0 } });
      }
    }

    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'likes':
        sortOptions = { 'likes': -1 };
        break;
      case 'views':
        sortOptions = { 'views': -1 };
        break;
      case 'comments':
        sortOptions = { 'comments': -1 };
        break;
      default:
        sortOptions = { 'createdAt': -1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      query: { q, tags, author, sortBy }
    });

  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/search/trending
router.get('/trending', async (req, res) => {
  try {
    const { page = 1, limit = 20, timeframe = 'week' } = req.query;
    const skip = (page - 1) * limit;

    const now = new Date();
    let dateThreshold;
    
    switch (timeframe) {
      case 'day':
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const posts = await Post.aggregate([
      {
        $match: {
          isPublic: true,
          createdAt: { $gte: dateThreshold }
        }
      },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
          engagementScore: {
            $add: [
              { $multiply: [{ $size: '$likes' }, 2] },
              { $size: '$comments' },
              { $divide: ['$views', 10] }
            ]
          }
        }
      },
      {
        $sort: { engagementScore: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [{ $project: { username: 1, avatar: 1 } }]
        }
      },
      {
        $unwind: '$author'
      }
    ]);

    const total = await Post.countDocuments({
      isPublic: true,
      createdAt: { $gte: dateThreshold }
    });

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      timeframe
    });

  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/search/tags
router.get('/tags', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const tags = await Post.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({ tags });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/search/suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const tagSuggestions = await Post.aggregate([
      { $unwind: '$tags' },
      { $match: { tags: { $regex: q, $options: 'i' } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { suggestion: '$_id', type: 'tag', _id: 0 } }
    ]);

    const userSuggestions = await User.find({
      username: { $regex: q, $options: 'i' },
      isActive: true
    })
    .select('username avatar')
    .limit(5)
    .lean();

    const formattedUserSuggestions = userSuggestions.map(user => ({
      suggestion: user.username,
      type: 'user',
      avatar: user.avatar
    }));

    const suggestions = [
      ...tagSuggestions,
      ...formattedUserSuggestions
    ].slice(0, 10);

    res.json({ suggestions });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
