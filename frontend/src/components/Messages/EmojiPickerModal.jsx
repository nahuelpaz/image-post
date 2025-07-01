import EmojiPicker from 'emoji-picker-react';

const EmojiPickerModal = ({ open, onClose, onEmojiSelect }) => {
  if (!open) return null;
  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 sm:left-auto sm:right-12 sm:translate-x-0" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>
        <EmojiPicker
          onEmojiClick={onEmojiSelect}
          theme="dark"
          width={320}
          height={400}
        />
      </div>
    </div>
  );
};

export default EmojiPickerModal;
