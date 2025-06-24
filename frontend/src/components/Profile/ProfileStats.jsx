const ProfileStats = ({
  followersCount,
  followingCount,
  postsCount,
  onShowFollowers,
  onShowFollowing,
}) => (
  <div className="flex justify-center md:justify-start gap-8 mb-6">
    <button
      className="text-center focus:outline-none hover:underline"
      style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}
      onClick={onShowFollowers}
    >
      <div className="text-lg font-semibold text-white">{followersCount}</div>
      <div className="text-sm text-gray-400">Followers</div>
    </button>
    <button
      className="text-center focus:outline-none hover:underline"
      style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}
      onClick={onShowFollowing}
    >
      <div className="text-lg font-semibold text-white">{followingCount}</div>
      <div className="text-sm text-gray-400">Following</div>
    </button>
    <div className="text-center">
      <div className="text-lg font-semibold text-white">{postsCount}</div>
      <div className="text-sm text-gray-400">Posts</div>
    </div>
  </div>
);

export default ProfileStats;
