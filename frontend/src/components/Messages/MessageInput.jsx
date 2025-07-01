import { useState, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import GifPickerModal from './GifPickerModal';
import EmojiPickerModal from './EmojiPickerModal';

const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY;

const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  sendingMessage, 
  handleSendMessage, 
  currentConversation,
  user,
  sendMessage,
  messagesListRef // Nuevo prop para scroll automático
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const inputRef = useRef(null);

  // Inserta el emoji en la posición actual del cursor
  const handleSelectEmoji = (emojiData) => {
    const emojiChar = emojiData.emoji;
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newValue =
      newMessage.substring(0, start) +
      emojiChar +
      newMessage.substring(end);
    setNewMessage(newValue);
    setShowEmojiPicker(false);
    // Mueve el cursor después del emoji
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emojiChar.length, start + emojiChar.length);
    }, 0);
  };

  // Inserta el GIF como imagen en el chat
  const handleSelectGif = (gif) => {
    if (currentConversation) {
      const recipient = currentConversation.participants.find(p => p._id !== (user?._id || user?.id));
      sendMessage(
        recipient?._id,
        '', // sin texto
        'image',
        gif.url // URL del GIF
      );
      // Hacer scroll hacia abajo después de enviar el GIF
      setTimeout(() => {
        if (messagesListRef?.current?.scrollToBottom) {
          messagesListRef.current.scrollToBottom();
        }
      }, 100);
    }
    setShowGifPicker(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="sticky bottom-0 bg-black/95 backdrop-blur border-t border-neutral-900 p-4">
      <form onSubmit={handleSendMessage} className="flex items-end gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="w-full px-5 py-3 bg-neutral-900 border border-neutral-800 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:bg-neutral-800 transition-all duration-200 text-sm pr-24"
            maxLength={500}
          />
          {newMessage.trim() && (
            <div className="absolute right-24 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {500 - newMessage.length}
            </div>
          )}
          {/* Botón de emoji a la derecha */}
          <button
            type="button"
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xl text-gray-400 hover:text-white focus:outline-none"
            onClick={() => {
              setShowEmojiPicker((v) => !v);
              setShowGifPicker(false);
            }}
            tabIndex={-1}
            aria-label="Insert emoji"
          >
            <Smile className="w-6 h-6" />
          </button>
          {/* Botón de GIF a la derecha */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold tracking-widest text-gray-400 hover:text-white focus:outline-none"
            onClick={() => {
              setShowGifPicker((v) => !v);
              setShowEmojiPicker(false);
            }}
            tabIndex={-1}
            aria-label="Insert GIF"
          >
            GIF
          </button>
          {/* Picker de emojis como componente aparte */}
          <EmojiPickerModal
            open={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onEmojiSelect={handleSelectEmoji}
          />
          {/* Picker de GIFs como componente aparte */}
          <GifPickerModal
            open={showGifPicker}
            onClose={() => setShowGifPicker(false)}
            onGifSelect={handleSelectGif}
            tenorApiKey={TENOR_API_KEY}
          />
        </div>
        <button
          type="submit"
          disabled={!newMessage.trim() || sendingMessage}
          className="w-10 h-10 bg-neutral-700 text-white rounded-full hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
          title="Send message"
        >
          <Send className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
