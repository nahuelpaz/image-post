const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  // Para optimizar consultas
  participantUsernames: [{
    type: String
  }]
}, {
  timestamps: true
});

// Índice para búsquedas rápidas por participantes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Método para verificar si un usuario es participante
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant.toString() === userId.toString()
  );
};

// Método para obtener el otro participante en una conversación de 2 personas
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(participant => 
    participant.toString() !== userId.toString()
  );
};

module.exports = mongoose.model('Conversation', conversationSchema);
