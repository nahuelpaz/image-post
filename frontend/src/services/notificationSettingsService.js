const API_URL = 'http://localhost:5000/api';

// Get notification settings
export const getNotificationSettings = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/users/settings/notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Get notification settings error:', error);
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (settings) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/users/settings/notifications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      throw new Error('Failed to update notification settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Update notification settings error:', error);
    throw error;
  }
};

export const notificationSettingsService = {
  getNotificationSettings,
  updateNotificationSettings
};
