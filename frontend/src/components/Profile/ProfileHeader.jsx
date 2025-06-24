import { useState } from 'react';
import { profileService } from '../../services/profileService';
import FollowersModal from './FollowersModal';
import ProfileAvatar from './ProfileAvatar';
import ProfileStats from './ProfileStats';

const ProfileHeader = ({ profile, isOwnProfile, onFollowToggle, onEditProfile }) => {
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  const [showFollowing, setShowFollowing] = useState(false);
  const [followingData, setFollowingData] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

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
        />
      </div>

      <div className="flex-1 pt-4 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-8">
          <h1 className="text-3xl font-light text-white">{profile?.username}</h1>
          {isOwnProfile ? (
            <button 
              onClick={onEditProfile}
              className="px-4 py-2 bg-transparent border border-gray-600 text-white font-semibold rounded hover:bg-gray-900 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <button 
              onClick={onFollowToggle}
              className={`px-4 py-2 font-semibold rounded transition-colors ${
                profile?.isFollowing 
                  ? 'bg-transparent border border-gray-600 text-white hover:bg-gray-900' 
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {profile?.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
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

        {profile?.email && isOwnProfile && (
          <div className="mb-4">
            <span className="text-gray-500 text-sm">{profile.email}</span>
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
    </div>
  );
};

export default ProfileHeader;
