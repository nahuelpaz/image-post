import { useRef } from 'react';
import { Image } from 'lucide-react';

const MAX_IMAGES = 4;

const ImageUploadButton = ({ onImageUpload, disabled }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    if (!disabled) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES);
    if (files.length && onImageUpload) {
      onImageUpload(files);
    }
    e.target.value = '';
  };

  return (
    <>
      <button
        type="button"
        className="absolute right-20 top-1/2 transform -translate-y-1/2 text-xl text-gray-400 hover:text-white focus:outline-none"
        onClick={handleButtonClick}
        disabled={disabled}
        aria-label="Insert image"
        tabIndex={-1}
      >
        <Image className="w-6 h-6" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        tabIndex={-1}
      />
    </>
  );
};

export default ImageUploadButton;
