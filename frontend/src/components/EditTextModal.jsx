import { X } from 'lucide-react';

const EditTextModal = ({
  title = 'Edit',
  fields = [],
  values = {},
  onChange,
  onClose,
  onSubmit,
  loading,
  error,
  submitLabel = 'Save'
}) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-sm">
    <form
      onSubmit={onSubmit}
      className="bg-black border border-neutral-900 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl text-white font-semibold">{title}</h2>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-neutral-900 transition"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>
      {error && (
        <div className="text-red-400 bg-red-900/20 border border-red-500/30 rounded px-3 py-2 text-xs mb-2">{error}</div>
      )}
      {fields.map(field => (
        <div key={field.name}>
          <label className="text-gray-300 text-sm mb-1 block">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              className="px-3 py-2 rounded-xl bg-neutral-950 text-white border border-neutral-800 focus:border-blue-500 outline-none w-full transition"
              value={values[field.name] || ''}
              onChange={e => onChange(field.name, e.target.value)}
              maxLength={field.maxLength}
              rows={field.rows || 3}
            />
          ) : (
            <input
              type={field.type || 'text'}
              className="px-3 py-2 rounded-xl bg-neutral-950 text-white border border-neutral-800 focus:border-blue-500 outline-none w-full transition"
              value={values[field.name] || ''}
              onChange={e => onChange(field.name, e.target.value)}
              maxLength={field.maxLength}
              required={field.required}
            />
          )}
        </div>
      ))}
      <div className="flex gap-4 mt-4">
        <button
          type="button"
          className="flex-1 py-2 rounded-xl bg-neutral-900 text-gray-200 hover:bg-neutral-800 border border-neutral-800 transition"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 rounded-xl bg-white text-black hover:bg-gray-200 transition font-semibold"
          disabled={loading}
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  </div>
);

export default EditTextModal;
