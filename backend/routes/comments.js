const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { createNotification, generateNotificationMessage } = require('../utils/notifications');

const router = express.Router();

// @route   POST /api/comments/:postId
router.post('/:postId', auth, [
  body('text').isLength({ min: 1, max: 200 }).trim().withMessage('Comment must be 1-200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;
    const postId = req.params.postId;

    const post = await Post.findById(postId).populate('author', 'username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user.id,
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Obtener el comentario recién agregado con su ID
    const addedComment = post.comments[post.comments.length - 1];

    // Crear notificación de comentario con ID del comentario
    await createNotification({
      recipient: post.author._id,
      sender: req.user.id,
      type: 'comment',
      post: post._id,
      comment: addedComment._id, // Agregar ID del comentario
      message: generateNotificationMessage('comment', req.user.username, post.title)
    });

    await post.populate('comments.user', 'username avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: addedComment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/comments/:postId
router.get('/:postId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const post = await Post.findById(req.params.postId)
      .populate({
        path: 'comments.user',
        select: 'username avatar'
      })
      .select('comments');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const totalComments = post.comments.length;
    const comments = post.comments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalComments,
        pages: Math.ceil(totalComments / limit)
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/comments/:postId/:commentId
router.delete('/:postId/:commentId', auth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId).populate('comments.user', '_id').populate('author', '_id');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Permitir borrar si es el autor del comentario o el autor del post
    const isCommentAuthor = comment.user._id.toString() === req.user.id;
    const isPostAuthor = post.author._id.toString() === req.user.id;
    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Elimina el comentario del array
    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();
    
    // Populate tanto el autor del post como los usuarios de los comentarios
    await post.populate('author', 'username avatar');
    await post.populate('comments.user', 'username avatar');

    res.json({ message: 'Comment deleted', post });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
