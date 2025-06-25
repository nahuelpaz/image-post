const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async ({ recipient, sender, type, post, comment, message }) => {
  try {
    // No crear notificación si el sender es el mismo que el recipient
    if (sender.toString() === recipient.toString()) {
      return null;
    }

    // Verificar las preferencias de notificación del usuario
    const recipientUser = await User.findById(recipient).select('notificationSettings');
    if (!recipientUser) {
      return null;
    }

    // Verificar si el usuario tiene habilitado este tipo de notificación
    const notificationSettings = recipientUser.notificationSettings || {
      likes: true,
      comments: true,
      follows: true
    };

    // Mapear tipos de notificación a configuraciones
    const typeMapping = {
      'like': 'likes',
      'comment': 'comments', 
      'follow': 'follows'
    };

    const settingKey = typeMapping[type];
    if (settingKey && !notificationSettings[settingKey]) {
      // El usuario tiene deshabilitado este tipo de notificación
      return null;
    }

    // Verificar si ya existe una notificación similar reciente (para evitar spam)
    const existingNotification = await Notification.findOne({
      recipient,
      sender,
      type,
      post: post || null,
      comment: comment || null,
      createdAt: { $gte: new Date(Date.now() - 60000) } // últimos 60 segundos
    });

    if (existingNotification) {
      return null;
    }

    const notification = new Notification({
      recipient,
      sender,
      type,
      post: post || undefined,
      comment: comment || undefined,
      message
    });

    await notification.save();
    return notification;

  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

const generateNotificationMessage = (type, senderUsername, postTitle = '') => {
  switch (type) {
    case 'like':
      return `${senderUsername} liked your post${postTitle ? ` "${postTitle}"` : ''}`;
    case 'comment':
      return `${senderUsername} commented on your post${postTitle ? ` "${postTitle}"` : ''}`;
    case 'follow':
      return `${senderUsername} started following you`;
    case 'post':
      return `${senderUsername} shared a new post${postTitle ? ` "${postTitle}"` : ''}`;
    default:
      return `${senderUsername} interacted with you`;
  }
};

module.exports = {
  createNotification,
  generateNotificationMessage
};
