const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE_URL}/messages/upload-image`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });
  const data = await res.json();
  if (!res.ok || !data.url) {
    throw new Error(data.message || 'Image upload failed');
  }
  return data.url;
};
