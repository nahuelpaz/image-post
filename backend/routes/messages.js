const express = require('express');
const { body, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate({
      path: 'participants',
      select: 'username avatar'  // Poblar todos los participantes
    })
    .populate({
      path: 'lastMessage',
      select: 'content messageType createdAt sender readBy',
      populate: {
        path: 'sender',
        select: 'username'
      }
    })
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Calcular mensajes no leídos por conversación
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: req.user.id },
          'readBy.user': { $ne: req.user.id }
        });

        return {
          ...conversation.toObject(),
          unreadCount
        };
      })
    );

    const total = await Conversation.countDocuments({
      participants: req.user.id
    });

    res.json({
      conversations: conversationsWithUnread,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/:conversationId
// @desc    Get messages from a specific conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verificar que el usuario sea parte de la conversación
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      conversation: req.params.conversationId,
      isDeleted: false
    })
    .populate('sender', 'username avatar')
    .populate('readBy.user', 'username')  // Poblar los usuarios que leyeron el mensaje
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Marcar mensajes como leídos (los que no sean del usuario actual)
    const unreadMessages = messages.filter(msg => 
      msg.sender._id.toString() !== req.user.id && 
      !msg.isReadBy(req.user.id)
    );

    for (const message of unreadMessages) {
      message.markAsReadBy(req.user.id);
      await message.save();
    }

    const total = await Message.countDocuments({
      conversation: req.params.conversationId,
      isDeleted: false
    });

    res.json({
      messages: messages.reverse(), // Devolver en orden cronológico
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/send
// @desc    Send a new message
router.post('/send', auth, [
  body('recipientId').notEmpty().withMessage('Recipient ID is required'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be 1-1000 characters'),
  body('messageType').optional().isIn(['text', 'image']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, content, messageType = 'text', image } = req.body;

    // Verificar que el destinatario existe
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // No permitir enviarse mensajes a sí mismo
    if (recipientId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Buscar conversación existente entre los dos usuarios
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] },
      $expr: { $eq: [{ $size: '$participants' }, 2] } // Solo conversaciones de 2 personas
    });

    // Si no existe, crear nueva conversación
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, recipientId],
        participantUsernames: [req.user.username, recipient.username]
      });
      await conversation.save();
    }

    // Crear el mensaje
    const message = new Message({
      conversation: conversation._id,
      sender: req.user.id,
      content,
      messageType,
      image: messageType === 'image' ? image : undefined
    });

    await message.save();

    // Actualizar la conversación con el último mensaje
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Poblar los datos del mensaje para la respuesta
    await message.populate([
      { path: 'sender', select: 'username avatar' },
      { path: 'readBy.user', select: 'username' }
    ]);

    // Emitir evento de Socket.IO a ambos usuarios
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const recipientSocketId = userSockets.get(recipientId);
    const senderSocketId = userSockets.get(req.user.id);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('newMessage', message);
    }
    if (senderSocketId && senderSocketId !== recipientSocketId) {
      io.to(senderSocketId).emit('newMessage', message);
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/conversation/start
// @desc    Start a new conversation with a user
router.post('/conversation/start', auth, [
  body('username').notEmpty().withMessage('Username is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.body;

    // Buscar al usuario por username
    const recipient = await User.findOne({ username });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (recipient._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }

    // Buscar conversación existente
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipient._id] },
      $expr: { $eq: [{ $size: '$participants' }, 2] }
    })
    .populate('participants', 'username avatar')
    .populate('lastMessage');

    // Si no existe, crear nueva
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, recipient._id],
        participantUsernames: [req.user.username, recipient.username]
      });
      await conversation.save();
      await conversation.populate('participants', 'username avatar');
    }

    res.json({
      message: 'Conversation ready',
      conversation
    });

  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark a specific message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verificar que el usuario es parte de la conversación
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation.isParticipant(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // No marcar como leído si es el propio mensaje
    if (message.sender.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot mark own message as read' });
    }

    // Marcar como leído si no está ya marcado
    if (!message.isReadBy(req.user.id)) {
      message.markAsReadBy(req.user.id);
      await message.save();
    }

    res.json({ message: 'Message marked as read' });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (soft delete)
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Solo el remitente puede eliminar el mensaje
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Get total unread messages count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      conversation: {
        $in: await Conversation.find({ participants: req.user.id }).distinct('_id')
      },
      sender: { $ne: req.user.id },
      'readBy.user': { $ne: req.user.id }
    });

    res.json({ unreadCount });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
