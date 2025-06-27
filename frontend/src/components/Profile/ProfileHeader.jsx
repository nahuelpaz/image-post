import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, UserPlus, UserMinus } from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useMessages } from '../../contexts/MessageContext';
import FollowersModal from './FollowersModal';
import ProfileAvatar from './ProfileAvatar';
import ProfileStats from './ProfileStats';
import AvatarModal from './AvatarModal';

const ProfileHeader = ({ profile, isOwnProfile, onFollowToggle, onEditProfile }) => {
  const navigate = useNavigate();
  const { startConversation, selectConversation } = useMessages();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  const [showFollowing, setShowFollowing] = useState(false);
  const [followingData, setFollowingData] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Estado para el modal del avatar
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setAvatarLoading(true);
      await profileService.updateAvatar(file);
      window.location.reload();
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setAvatarLoading(false);
    }
  };

  const getAvatarSrc = () => {
    if (profile?.avatar) {
      return profile.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'User')}&background=262626&color=ffffff&size=128`;
  };

  const handleAvatarClick = () => {
    // Solo abrir modal si tiene avatar real (no generado)
    if (profile?.avatar) {
      setShowAvatarModal(true);
    }
  };

  const handleSendMessage = async () => {
    if (!profile?.username) return;
    
    try {
      setMessageLoading(true);
      // Intentar iniciar/encontrar conversación con el usuario
      const conversation = await startConversation(profile.username);
      
      // Seleccionar la conversación
      await selectConversation(conversation);
      
      // Navegar a la página de mensajes con el chat ya abierto
      navigate('/messages', { state: { openChat: true, conversation } });
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleShowFollowers = async () => {
    if (Array.isArray(profile.followers) && profile.followers.length > 0 && typeof profile.followers[0] === 'string') {
      setLoadingFollowers(true);
      try {
        const users = await profileService.getUsersByIds(profile.followers);
        setFollowersData(users);
      } catch (e) {
        setFollowersData([]);
      }
      setLoadingFollowers(false);
    } else {
      setFollowersData(profile.followers || []);
    }
    setShowFollowers(true);
  };

  const handleShowFollowing = async () => {
    if (Array.isArray(profile.following) && profile.following.length > 0 && typeof profile.following[0] === 'string') {
      setLoadingFollowing(true);
      try {
        const users = await profileService.getUsersByIds(profile.following);
        setFollowingData(users);
      } catch (e) {
        setFollowingData([]);
      }
      setLoadingFollowing(false);
    } else {
      setFollowingData(profile.following || []);
    }
    setShowFollowing(true);
  };

  const followersCount = typeof profile.followersCount === 'number'
    ? profile.followersCount
    : Array.isArray(profile.followers)
      ? profile.followers.length
      : 0;

  const followingCount = typeof profile.followingCount === 'number'
    ? profile.followingCount
    : Array.isArray(profile.following)
      ? profile.following.length
      : 0;

  const postsCount = typeof profile.postsCount === 'number'
    ? profile.postsCount
    : Array.isArray(profile.posts)
      ? profile.posts.length
      : 0;

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-16 py-8 border-b border-gray-800">
      <div className="flex-shrink-0 text-center md:text-left">
        <ProfileAvatar
          avatarSrc={getAvatarSrc()}
          username={profile?.username}
          isOwnProfile={isOwnProfile}
          avatarLoading={avatarLoading}
          handleAvatarChange={handleAvatarChange}
          onAvatarClick={handleAvatarClick}
        />
      </div>

      <div className="flex-1 pt-4 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-8">
          <h1 className="text-3xl font-light text-white">{profile?.username}</h1>
          {isOwnProfile ? (
            <button 
              onClick={onEditProfile}
              className="px-4 py-2 bg-transparent border border-gray-600 text-white font-semibold rounded-lg hover:bg-neutral-900 hover:border-gray-600 transition-all duration-200"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex flex-row gap-3 justify-center md:justify-start">
              <button 
                onClick={onFollowToggle}
                className={`px-4 py-2 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  profile?.isFollowing 
                    ? 'bg-transparent border border-gray-600 text-white hover:bg-neutral-900 hover:border-gray-600' 
                    : 'bg-white text-black hover:bg-gray-50 border border-white'
                }`}
                title={profile?.isFollowing ? 'Unfollow user' : 'Follow user'}
              >
                {profile?.isFollowing ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={messageLoading}
                className="px-4 py-2 bg-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                title="Send message"
              >
                {messageLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <MessageCircle className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
        </div>

        <ProfileStats
          followersCount={followersCount}
          followingCount={followingCount}
          postsCount={postsCount}
          onShowFollowers={handleShowFollowers}
          onShowFollowing={handleShowFollowing}
        />

        {profile?.bio && (
          <div className="mb-4">
            <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {showFollowers && (
        <FollowersModal
          title="Followers"
          users={followersData}
          loading={loadingFollowers}
          onClose={() => setShowFollowers(false)}
        />
      )}
      {showFollowing && (
        <FollowersModal
          title="Following"
          users={followingData}
          loading={loadingFollowing}
          onClose={() => setShowFollowing(false)}
        />
      )}

      {/* Modal para ver avatar en pantalla completa */}
      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        avatarSrc={profile?.avatar}
        username={profile?.username}
      />
    </div>
  );
};


export default ProfileHeader;
