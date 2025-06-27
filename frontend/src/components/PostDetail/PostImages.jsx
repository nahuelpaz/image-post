import { ChevronLeft, ChevronRight, Download, Expand, X } from 'lucide-react';
import { useState } from 'react';

const PostImages = ({
  images,
  activeImage,
  setActiveImage,
  handleDownloadImage,
  authorUsername,
  postTitle,
  isMobile = false
}) => {
  const [expandedModalOpen, setExpandedModalOpen] = useState(false);
  const [expandedActiveImage, setExpandedActiveImage] = useState(0);

  if (!images || images.length === 0) return null;
  
  const containerStyles = isMobile 
    ? {
        minHeight: 400,
        height: 400,
        maxHeight: 400,
      }
    : {
        minHeight: 700,
        height: 700,
        maxHeight: 700,
      };

  return (
    <div
      className={`${isMobile ? 'w-full' : 'md:w-[70%]'} bg-black flex items-center justify-center ${isMobile ? 'p-4' : 'p-12'} ${!isMobile ? 'border-r border-neutral-900' : ''} relative`}
      style={containerStyles}
    >
      {/* Botón de expandir en la esquina superior izquierda */}
      <button
        onClick={() => {
          setExpandedActiveImage(activeImage);
          setExpandedModalOpen(true);
        }}
        className="absolute top-4 left-4 bg-black/70 hover:bg-black/90 rounded-full p-2 z-10 border border-neutral-800 transition"
        title="Expand image"
      >
        <Expand className="w-5 h-5 text-white" />
      </button>

      <button
        onClick={() => handleDownloadImage(images[activeImage])}
        className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 rounded-full p-2 z-10 border border-neutral-800 transition"
        title="Download this image"
      >
        <Download className="w-5 h-5 text-white" />
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
        {/* Elimina el Link superpuesto */}
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
            border: isMobile ? '2px solid #232323' : '4px solid #232323',
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

      {/* Modal de imagen expandida */}
      {expandedModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setExpandedModalOpen(false)}
        >
          <div
            className="relative flex items-center justify-center w-full h-full p-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              className="absolute top-6 right-6 bg-black/70 hover:bg-black/90 rounded-full p-3 z-20 border border-neutral-800 transition"
              onClick={() => setExpandedModalOpen(false)}
              aria-label="Close expanded view"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Botón descargar en modal expandido */}
            <button
              onClick={() => handleDownloadImage(images[expandedActiveImage])}
              className="absolute top-6 right-20 bg-black/70 hover:bg-black/90 rounded-full p-3 z-20 border border-neutral-800 transition"
              title="Download this image"
            >
              <Download className="w-6 h-6 text-white" />
            </button>

            {/* Navegación izquierda */}
            {images.length > 1 && expandedActiveImage > 0 && (
              <button
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-3 z-20"
                onClick={() => setExpandedActiveImage(i => Math.max(i - 1, 0))}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Navegación derecha */}
            {images.length > 1 && expandedActiveImage < images.length - 1 && (
              <button
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-3 z-20"
                onClick={() => setExpandedActiveImage(i => Math.min(i + 1, images.length - 1))}
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Imagen expandida */}
            <img
              src={images[expandedActiveImage]?.url || 'https://via.placeholder.com/900x900/000000/ffffff?text=Image'}
              alt={postTitle}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{
                maxWidth: '95vw',
                maxHeight: '95vh',
              }}
            />

            {/* Indicadores de imagen */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      expandedActiveImage === idx ? 'bg-white' : 'bg-gray-600 hover:bg-gray-400'
                    }`}
                    onClick={() => setExpandedActiveImage(idx)}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Información de la imagen */}
            <div className="absolute bottom-6 left-6 bg-black/70 rounded-lg px-4 py-2 text-white text-sm">
              {images.length > 1 && (
                <span>{expandedActiveImage + 1} of {images.length}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PostImages;
