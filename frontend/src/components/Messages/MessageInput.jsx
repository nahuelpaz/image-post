import { useState, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import GifPickerModal from './GifPickerModal';
import EmojiPickerModal from './EmojiPickerModal';
import ImageUploadButton from './ImageUploadButton';
import { uploadImage } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY;
const MAX_IMAGES = 4;

const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  sendingMessage, 
  handleSendMessage, 
  currentConversation,
  user,
  sendMessage,
  messagesListRef
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]); // [{file, url}]
  const inputRef = useRef(null);
  const { token } = useAuth();

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

  // Handler para subir imagen y enviar mensaje
  const handleImageUpload = (files) => {
    const previews = files.slice(0, MAX_IMAGES - imagePreviews.length).map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  // Eliminar una imagen del preview
  const handleRemovePreview = (idx) => {
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Enviar mensaje (texto y/o imágenes)
  const handleSend = async (e) => {
    e.preventDefault();
    if (!currentConversation) return;
    const recipient = currentConversation.participants.find(p => p._id !== (user?._id || user?.id));
    if (newMessage.trim()) {
      await handleSendMessage(e);
    }
    if (imagePreviews.length > 0) {
      for (const img of imagePreviews) {
        try {
          const imageUrl = await uploadImage(img.file, token);
          if (imageUrl) {
            await sendMessage(
              recipient?._id,
              '',
              'image',
              imageUrl
            );
          }
        } catch (err) {
          console.error('Error uploading image:', err);
        }
      }
      setImagePreviews([]);
    }
    setTimeout(() => {
      if (messagesListRef?.current?.scrollToBottom) {
        messagesListRef.current.scrollToBottom();
      }
    }, 100);
  };

  return (
    <div className="sticky bottom-0 bg-black/95 backdrop-blur border-t border-neutral-900 p-4">
      <form onSubmit={handleSend} className="flex items-end gap-3 flex-row relative w-full">
        {/* Previews de imágenes flotando arriba del input, sin fondo */}
        {imagePreviews.length > 0 && (
          <div className="flex gap-2 mb-2 w-full absolute -top-20 left-0 z-50 justify-center pointer-events-none">
            {imagePreviews.map((img, idx) => (
              <div key={idx} className="relative group pointer-events-auto">
                <img src={img.url} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-neutral-700" />
                <button
                  type="button"
                  className="absolute -top-1 -right-1 bg-black/80 text-white rounded-full p-0.5 hover:bg-red-600 z-10 text-xs w-5 h-5 flex items-center justify-center shadow-md"
                  onClick={() => handleRemovePreview(idx)}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 relative w-full">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="w-full px-5 py-3 bg-neutral-900 border border-neutral-800 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:bg-neutral-800 transition-all duration-200 text-sm pr-24"
            maxLength={500}
          />
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
          {/* Botón de imagen a la derecha */}
          <ImageUploadButton onImageUpload={handleImageUpload} disabled={sendingMessage || imagePreviews.length >= MAX_IMAGES} />
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
          disabled={(!newMessage.trim() && imagePreviews.length === 0) || sendingMessage}
          className="w-10 h-10 bg-neutral-700 text-white rounded-full hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group ml-1"
          title="Send message"
        >
          <Send className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;