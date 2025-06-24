const ConfirmDeleteModal = ({
  open,
  title = "Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
  loading = false
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-black border border-neutral-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center">
        <h2 className="text-xl text-white font-semibold mb-4">{title}</h2>
        <p className="text-gray-300 mb-6 text-center">{message}</p>
        <div className="flex gap-4 w-full">
          <button
            className="flex-1 py-2 rounded-xl bg-neutral-900 text-gray-200 hover:bg-neutral-800 border border-neutral-800 transition"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className="flex-1 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-semibold"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
