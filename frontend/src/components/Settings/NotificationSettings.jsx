import { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Save } from 'lucide-react';
import SettingsDropdown from './SettingsDropdown';
import { notificationSettingsService } from '../../services/notificationSettingsService';

const NotificationSettings = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [settings, setSettings] = useState({
    browserNotifications: {
      likes: true,
      comments: true,
      follows: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await notificationSettingsService.getNotificationSettings();
      setSettings({
        browserNotifications: response.notificationSettings
      });
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleToggle = (type) => {
    setSettings(prev => ({
      ...prev,
      browserNotifications: {
        ...prev.browserNotifications,
        [type]: !prev.browserNotifications[type]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await notificationSettingsService.updateNotificationSettings(settings.browserNotifications);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      // TODO: Show error message to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage how you receive notifications
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Browser Notifications */}
      <SettingsDropdown
        title="Browser Notifications"
        icon={Bell}
        isExpanded={expandedSection === 'browser'}
        onToggle={() => toggleSection('browser')}
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm mb-4">
            Choose which activities trigger browser notifications
          </p>
          
          {/* Likes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-4 h-4 text-red-500" />
              <div>
                <span className="text-white">Likes</span>
                <p className="text-gray-400 text-xs">When someone likes your posts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.browserNotifications.likes}
                onChange={() => handleToggle('likes')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Comments */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <div>
                <span className="text-white">Comments</span>
                <p className="text-gray-400 text-xs">When someone comments on your posts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.browserNotifications.comments}
                onChange={() => handleToggle('comments')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Follows */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserPlus className="w-4 h-4 text-green-500" />
              <div>
                <span className="text-white">New Followers</span>
                <p className="text-gray-400 text-xs">When someone starts following you</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.browserNotifications.follows}
                onChange={() => handleToggle('follows')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </SettingsDropdown>
    </div>
  );
};

export default NotificationSettings;
