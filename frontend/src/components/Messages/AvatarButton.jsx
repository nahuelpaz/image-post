import { User } from 'lucide-react';

const AvatarButton = ({ avatar, username, onClick, ...props }) => (
  <button
    onClick={onClick}
    className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-blue-600 transition group cursor-pointer mt-0"
    title={avatar ? `View ${username}'s avatar` : 'No avatar to view'}
    disabled={!avatar}
    style={{ alignSelf: 'flex-start' }}
    {...props}
  >
    {avatar ? (
      <img src={avatar} alt={username} className="w-full h-full object-cover" />
    ) : (
      <User className="w-4 h-4 text-gray-600" />
    )}
  </button>
);

export default AvatarButton;
