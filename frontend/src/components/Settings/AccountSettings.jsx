import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Trash2 } from 'lucide-react';
import SettingsDropdown from './SettingsDropdown';

const AccountSettings = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para controlar qué sección está expandida
  const [expandedSection, setExpandedSection] = useState(null);

  // Estados para cada formulario
  const [emailForm, setEmailForm] = useState({
    email: user?.email || '',
    password: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteForm, setDeleteForm] = useState({
    confirmText: '',
    password: ''
  });

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
    clearMessages();
  };

  // Cambiar email
  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!emailForm.email.trim() || !emailForm.password.trim()) return;
    
    try {
      setLoading(true);
      clearMessages();
      
      await profileService.changeEmail(emailForm.email, emailForm.password);
      
      setSuccess('Email updated successfully');
      setEmailForm({ email: '', password: '' });
    } catch (error) {
      setError(error.message || 'Error updating email');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      clearMessages();
      
      await profileService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      setSuccess('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cuenta
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteForm.confirmText !== 'DELETE' || !deleteForm.password.trim()) {
      setError('Please type DELETE and enter your password to confirm');
      return;
    }
    
    try {
      setLoading(true);
      clearMessages();
      
      await profileService.deleteAccount(deleteForm.password);
      
      logout();
      navigate('/login');
    } catch (error) {
      setError(error.message || 'Error deleting account');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Account Settings</h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage your account information and security settings
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Change Email Section */}
      <SettingsDropdown
        title="Change Email"
        icon={Mail}
        isExpanded={expandedSection === 'email'}
        onToggle={() => toggleSection('email')}
      >
        <form onSubmit={handleEmailChange} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Email
            </label>
            <input
              type="email"
              value={emailForm.email}
              onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={emailForm.password}
              onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </SettingsDropdown>

      {/* Change Password Section */}
      <SettingsDropdown
        title="Change Password"
        icon={Lock}
        isExpanded={expandedSection === 'password'}
        onToggle={() => toggleSection('password')}
      >
        <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </SettingsDropdown>

      {/* Delete Account Section */}
      <SettingsDropdown
        title="Delete Account"
        icon={Trash2}
        isExpanded={expandedSection === 'delete'}
        onToggle={() => toggleSection('delete')}
        className="red-section"
      >
        <p className="text-gray-300 text-sm mt-4 mb-4">
          This action cannot be undone. This will permanently delete your account and all associated data.
        </p>
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={deleteForm.confirmText}
              onChange={(e) => setDeleteForm(prev => ({ ...prev, confirmText: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-red-500 transition"
              placeholder="DELETE"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={deleteForm.password}
              onChange={(e) => setDeleteForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-red-500 transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || deleteForm.confirmText !== 'DELETE' || !deleteForm.password.trim()}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${
              deleteForm.confirmText === 'DELETE' && deleteForm.password.trim()
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-600 text-gray-400'
            } disabled:opacity-50`}
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </form>
      </SettingsDropdown>
    </div>
  );
};

export default AccountSettings;
