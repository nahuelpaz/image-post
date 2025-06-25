import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import AccountSettings from './AccountSettings';
import NotificationSettings from './NotificationSettings';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account Settings', component: AccountSettings },
    { id: 'notifications', label: 'Notifications', component: NotificationSettings },
    // { id: 'privacy', label: 'Privacy & Security', component: PrivacySettings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-neutral-950 text-white border border-neutral-800'
                      : 'text-gray-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:w-3/4">
            <div className="bg-black rounded-2xl border border-neutral-900 p-8 shadow-2xl">
              {ActiveComponent && <ActiveComponent user={user} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
