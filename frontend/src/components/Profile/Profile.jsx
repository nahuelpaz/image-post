import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import Navbar from '../layout/Navbar';
import ProfileHeader from './ProfileHeader';
import ProfilePosts from './ProfilePosts';
import EditProfileModal from './EditProfileModal';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isOwnProfile = !username || username === currentUser?.username;
  const targetUsername = username || currentUser?.username;

  useEffect(() => {
    loadProfile();
  }, [targetUsername]);

  useEffect(() => {
    loadPosts();
  }, [targetUsername, page]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = isOwnProfile 
        ? await profileService.getCurrentUser()
        : await profileService.getUserProfile(targetUsername);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const postsData = await profileService.getUserPosts(targetUsername, page);
      if (page === 1) {
        setPosts(postsData.posts || []);
      } else {
        setPosts(prev => [...prev, ...(postsData.posts || [])]);
      }
      setHasMore(postsData.hasMore || false);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      await profileService.followUser(profile._id);
      // Solo recarga el perfil (no toda la página)
      await loadProfile();
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-light text-white">User not found</h2>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar advertencia si falta nombre (pero NO por avatar vacío)
  if (!profile.username) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-light text-white">Perfil incompleto o datos faltantes</h2>
            <pre className="text-gray-400 text-xs mt-2">{JSON.stringify(profile, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileHeader 
          profile={profile}
          isOwnProfile={isOwnProfile}
          onFollowToggle={handleFollowToggle}
          onEditProfile={() => setShowEditModal(true)}
        />
        
        <ProfilePosts 
          posts={posts}
          loading={postsLoading}
          hasMore={hasMore}
          onLoadMore={() => setPage(prev => prev + 1)}
        />
      </div>

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};


export default Profile;
