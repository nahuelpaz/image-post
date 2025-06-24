import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

const PostImages = ({
  images,
  activeImage,
  setActiveImage,
  handleDownloadImage,
  authorUsername,
  postTitle
}) => {
  if (!images || images.length === 0) return null;
  return (
    <div
      className="md:w-[70%] bg-black flex items-center justify-center p-12 border-r border-neutral-900 relative"
      style={{
        minHeight: 700,
        height: 700,
        maxHeight: 700,
      }}
    >
      <button
        onClick={() => handleDownloadImage(images[activeImage])}
        className="absolute top-6 right-6 bg-black/70 hover:bg-black/90 rounded-full p-2 z-20 border border-neutral-800 transition"
        title="Download this image"
      >
        <Download className="w-6 h-6 text-white" />
      </button>

      {images.length > 1 && activeImage > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 z-10"
          onClick={() => setActiveImage(i => Math.max(i - 1, 0))}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
      )}

      {images.length > 1 && activeImage < images.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 z-10"
          onClick={() => setActiveImage(i => Math.min(i + 1, images.length - 1))}
          aria-label="Next image"
        >
          <ChevronRight className="w-7 h-7 text-white" />
        </button>
      )}

      <div className="relative flex items-center justify-center w-full h-full">
        <Link
          to={`/profile/${authorUsername}`}
          className="block w-full h-full"
          tabIndex={-1}
          aria-label={`Go to ${authorUsername}'s profile`}
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        />
        <img
          src={images[activeImage]?.url || 'https://via.placeholder.com/900x900/000000/ffffff?text=Image'}
          alt={postTitle}
          className="rounded-2xl object-contain bg-black shadow-2xl"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            border: '4px solid #232323',
            position: 'relative',
            zIndex: 2
          }}
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`block w-2.5 h-2.5 rounded-full ${activeImage === idx ? 'bg-white' : 'bg-gray-700'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostImages;
