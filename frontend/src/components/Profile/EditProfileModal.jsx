import { useState } from 'react';
import { profileService } from '../../services/profileService';
import EditTextModal from '../EditTextModal';

const EditProfileModal = ({ profile, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    email: profile?.email || '',
    password: '',
    bio: profile?.bio || ''
  });
  const [showPassword, setShowPassword] = useState(false);
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
      const payload = { ...formData };
      if (!showPassword || !payload.password) delete payload.password;
      const updatedProfile = await profileService.updateProfile(payload);
      onUpdate(updatedProfile);
    } catch (error) {
      setError(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  // Campos base
  const fields = [
    { name: 'username', label: 'Username', maxLength: 100, required: true },
    { name: 'email', label: 'Email', type: 'email', maxLength: 100, required: true },
    { name: 'bio', label: 'Bio', type: 'textarea', maxLength: 500 }
  ];

  // Agrega el campo de contraseña solo si showPassword es true
  if (showPassword) {
    fields.splice(2, 0, {
      name: 'password',
      label: 'New Password',
      type: 'password',
      maxLength: 100,
      required: false
    });
  }

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
    >
      {/* Botón para mostrar/ocultar el campo de contraseña */}
      <button
        type="button"
        className="text-blue-400 hover:underline text-sm mt-2"
        style={{ marginTop: '-12px', marginBottom: '8px' }}
        onClick={() => setShowPassword(v => !v)}
      >
        {showPassword ? 'Hide password field' : 'Change password'}
      </button>
    </EditTextModal>
  );
};


export default EditProfileModal;
