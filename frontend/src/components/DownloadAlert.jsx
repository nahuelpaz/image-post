import { useEffect, useState } from 'react';
import { CheckCircle, Download, X } from 'lucide-react';

const DownloadAlert = ({ show, onClose, message, type = 'success' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Small delay to allow DOM to render before starting animation
      setTimeout(() => setIsVisible(true), 50);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 200); // Wait for animation to complete
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          transform transition-all duration-200 ease-out
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-[-10px] opacity-0 scale-98'}
        `}
      >
        <div className="bg-black border border-neutral-800 rounded-xl shadow-2xl p-4 min-w-[320px] max-w-[400px]">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Download className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm leading-5">
                Download Complete
              </p>
              <p className="text-gray-400 text-xs mt-1 leading-4">
                {message}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadAlert;
