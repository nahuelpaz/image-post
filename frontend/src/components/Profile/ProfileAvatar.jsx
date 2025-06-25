import { Loader2, Camera } from 'lucide-react';

const ProfileAvatar = ({
  avatarSrc,
  username,
  isOwnProfile,
  avatarLoading,
  handleAvatarChange,
  onAvatarClick,
}) => {
  // No permitir click para abrir modal si es un avatar generado
  const isGeneratedAvatar = avatarSrc?.includes('ui-avatars.com');
  const shouldAllowClick = !isGeneratedAvatar;

  return (
    <div className="relative w-32 h-32 mx-auto md:mx-0">
      <img 
        src={avatarSrc} 
        alt={username}
        className={`w-full h-full rounded-full object-cover border border-gray-700 ${
          shouldAllowClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
        }`}
        onClick={shouldAllowClick ? onAvatarClick : undefined}
      />
      {isOwnProfile && (
        <label className="absolute bottom-1 right-1 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarChange}
            disabled={avatarLoading}
            className="hidden"
          />
          {avatarLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </label>
      )}
    </div>
  );
};

export default ProfileAvatar;
