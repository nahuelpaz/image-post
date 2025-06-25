import { useState } from 'react';
import { profileService } from '../../services/profileService';
import EditTextModal from '../EditTextModal';

const EditProfileModal = ({ profile, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  // Solo campos básicos del perfil
  const fields = [
    { name: 'username', label: 'Username', maxLength: 100, required: true },
    { name: 'bio', label: 'Bio', type: 'textarea', maxLength: 500 }
  ];

  return (
    <EditTextModal
      title="Edit Profile"
      fields={fields}
      values={formData}
      onChange={handleChange}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Save Changes"
    />
  );
};


export default EditProfileModal;
