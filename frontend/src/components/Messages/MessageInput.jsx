import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  sendingMessage, 
  handleSendMessage 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
            className="w-full px-5 py-3 bg-neutral-900 border border-neutral-800 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:bg-neutral-800 transition-all duration-200 text-sm pr-12"
            disabled={sendingMessage}
            maxLength={500}
          />
          {newMessage.trim() && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {500 - newMessage.length}
            </div>
          )}
          {/* Botón de emoji a la derecha */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-gray-400 hover:text-yellow-400 focus:outline-none"
            onClick={() => setShowEmojiPicker((v) => !v)}
            tabIndex={-1}
            aria-label="Insert emoji"
          >
            😊
          </button>
          {/* Picker de emojis */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 z-50">
              <EmojiPicker
                onEmojiClick={handleSelectEmoji}
                theme="dark"
                width={320}
                height={400}
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!newMessage.trim() || sendingMessage}
          className="w-10 h-10 bg-neutral-700 text-white rounded-full hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
          title="Send message"
        >
          {sendingMessage ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
