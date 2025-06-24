import { useState } from 'react';
import { X, Loader2, User, FileText, Save } from 'lucide-react';
import { profileService } from '../../services/profileService';

const EditProfileModal = ({ profile, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const updatedProfile = await profileService.updateProfile(formData);
      onUpdate(updatedProfile);
    } catch (error) {
      setError(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-black border border-neutral-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={e => e.stopPropagation()}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Edit Profile</h2>
              <p className="text-sm text-gray-400">Update your profile information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8 bg-black">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-200">
              <User className="w-4 h-4" />
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-10 py-3 rounded-xl bg-neutral-900 text-white border border-neutral-800 focus:border-blue-500 outline-none transition placeholder-gray-500"
                placeholder="Enter your username"
                autoComplete="username"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500 ml-1">
              This is how others will find you
            </p>
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium text-gray-200">
              <FileText className="w-4 h-4" />
              Bio
            </label>
            <div className="relative">
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                placeholder="Tell us about yourself..."
                className="w-full px-10 py-3 rounded-xl bg-neutral-900 text-white border border-neutral-800 focus:border-blue-500 outline-none transition placeholder-gray-500 resize-none"
              />
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
            <div className="flex justify-between items-center text-xs">
              <p className="text-gray-500 ml-1">Share a bit about yourself</p>
              <p className={`${formData.bio.length > 450 ? 'text-red-400' : 'text-gray-500'}`}>
                {formData.bio.length}/500
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-black border border-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white hover:bg-gray-100 text-black font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
