import GifPicker from 'gif-picker-react';

const GifPickerModal = ({ open, onClose, onGifSelect, tenorApiKey }) => {
  if (!open) return null;
  return (
    <>
      {/* Mobile: fondo clickeable y picker centrado */}
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:hidden" onClick={onClose}>
        <div className="mb-20 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
          <GifPicker
            tenorApiKey={tenorApiKey}
            onGifClick={onGifSelect}
            width={400}
            height={400}
            theme="dark"
            autoFocusSearch={true}
          />
        </div>
      </div>
      {/* Desktop: posición original a la derecha */}
      <div className="hidden sm:block absolute bottom-12 right-0 z-50 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800" style={{ width: 400 }}>
        <GifPicker
          tenorApiKey={tenorApiKey}
          onGifClick={onGifSelect}
          width={400}
          height={400}
          theme="dark"
          autoFocusSearch={true}
        />
      </div>
    </>
  );
};

export default GifPickerModal;
