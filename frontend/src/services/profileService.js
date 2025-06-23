const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const profileService = {
  // Get user profile by username
  getUserProfile: async (username) => {
    const response = await fetch(`${API_BASE_URL}/users/${username}`);
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    return response.json();
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    const data = await response.json();
    return data.user || data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    const data = await response.json();
    return data.user || data;
  },

  // Update avatar
  updateAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update avatar');
    }
    
    const data = await response.json();
    return data.user || data;
  },

  // Follow/unfollow user
  followUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to follow/unfollow user');
    }
    return response.json();
  },

  // Get user posts
  getUserPosts: async (username, page = 1, limit = 12) => {
    const response = await fetch(`${API_BASE_URL}/users/${username}/posts?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to get user posts');
    }
    return response.json();
  },
};
