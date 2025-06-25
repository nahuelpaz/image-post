import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Trash2, ChevronRight } from 'lucide-react';

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
        <h2 className="text-xl font-medium text-white mb-4">Account Settings</h2>
        <p className="text-gray-400 text-sm">
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
      <div className="border border-neutral-800 rounded-2xl bg-neutral-950/50 overflow-hidden">
        <button
          onClick={() => toggleSection('email')}
          className="w-full flex items-center justify-between p-6 hover:bg-neutral-900/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-medium text-white">Change Email</h3>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            expandedSection === 'email' ? 'rotate-90' : ''
          }`} />
        </button>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expandedSection === 'email' 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="px-6 pb-6 border-t border-neutral-800">
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
                className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="border border-neutral-800 rounded-2xl bg-neutral-950/50 overflow-hidden">
        <button
          onClick={() => toggleSection('password')}
          className="w-full flex items-center justify-between p-6 hover:bg-neutral-900/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-medium text-white">Change Password</h3>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            expandedSection === 'password' ? 'rotate-90' : ''
          }`} />
        </button>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expandedSection === 'password' 
            ? 'max-h-[500px] opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="px-6 pb-6 border-t border-neutral-800">
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
                className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="border border-red-500/30 rounded-2xl bg-red-900/10 overflow-hidden">
        <button
          onClick={() => toggleSection('delete')}
          className="w-full flex items-center justify-between p-6 hover:bg-red-900/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-medium text-red-400">Delete Account</h3>
          </div>
          <ChevronRight className={`w-5 h-5 text-red-400 transition-transform duration-300 ${
            expandedSection === 'delete' ? 'rotate-90' : ''
          }`} />
        </button>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expandedSection === 'delete' 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="px-6 pb-6 border-t border-red-500/30">
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
                className={`px-6 py-3 font-semibold rounded-xl transition-colors ${
                  deleteForm.confirmText === 'DELETE' && deleteForm.password.trim()
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-600 text-gray-400'
                } disabled:opacity-50`}
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
