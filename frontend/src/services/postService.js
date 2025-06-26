const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const postService = {
  // Subir múltiples imágenes
  uploadMultipleImages: async (images) => {
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));
    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error uploading images');
    }
    return response.json();
  },

  // Subir archivo ZIP
  uploadArchive: async (zipFile) => {
    const formData = new FormData();
    formData.append('archive', zipFile);
    const response = await fetch(`${API_BASE_URL}/upload/archive`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error uploading archive');
    }
    return response.json();
  },

  // Crear post
  createPost: async ({ title, description, tags, images, archiveInfo }) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        tags,
        images,
        archiveInfo,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error creating post');
    }
    return response.json();
  },
};
