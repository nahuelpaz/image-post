import { X, ArrowDownToLine } from 'lucide-react';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import DownloadAlert from '../DownloadAlert';

// Permite mostrar cualquier imagen (avatar o gif) y personalizar el nombre del archivo
const AvatarModal = ({ isOpen, onClose, avatarSrc, username, fileLabel = 'avatar', fileExt = 'jpg', downloadName }) => {
  const [downloadAlert, setDownloadAlert] = useState({ show: false, message: '' });

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(avatarSrc);
      const blob = await response.blob();
      // Usa downloadName si está, si no arma uno por defecto
      const filename = downloadName || `${username}_${fileLabel}.${fileExt}`;
      saveAs(blob, filename);
      setDownloadAlert({
        show: true,
        message: `${fileLabel.charAt(0).toUpperCase() + fileLabel.slice(1)} downloaded successfully`
      });
    } catch (error) {
      setDownloadAlert({
        show: true,
        message: `Failed to download ${fileLabel}. Please try again.`
      });
    }
  };

  // No mostrar modal si es avatar generado (solo si es avatar)
  const isGeneratedAvatar = fileLabel === 'avatar' && avatarSrc?.includes('ui-avatars.com');
  if (isGeneratedAvatar) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="relative max-w-4xl max-h-[90vh] mx-4">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Botón descargar */}
          <button
            onClick={handleDownload}
            className="absolute -top-12 right-12 text-white hover:text-gray-300 transition-colors z-10"
            aria-label={`Download ${fileLabel}`}
          >
            <ArrowDownToLine className="w-8 h-8" />
          </button>

          {/* Imagen (avatar o gif) */}
          <div className="relative">
            <img
              src={avatarSrc}
              alt={`${username} ${fileLabel}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Área clickeable para cerrar */}
        <div 
          className="absolute inset-0 -z-10"
          onClick={onClose}
        />
      </div>

      {/* Alerta de descarga */}
      <DownloadAlert
        show={downloadAlert.show}
        onClose={() => setDownloadAlert({ show: false, message: '' })}
        message={downloadAlert.message}
        type="success"
      />
    </>
  );
};

export default AvatarModal;
