import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import UserCard from './Search/UserCard';


const Dashboard = () => {
  const { user } = useAuth();

  // Ejemplo de featuredUsers, reemplaza por tu lógica real si tienes usuarios destacados
  const featuredUsers = []; // o usa un useState/useEffect para traer usuarios

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome back, {user?.username}!

              </h2>
              <p className="text-gray-400 text-lg">
                Ready to share your amazing images with the world?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Link
                to="/create-post"
                className="group relative aspect-square bg-black border border-neutral-900 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4 hover:border-blue-600 transition-colors cursor-pointer"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover:scale-105 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold mb-1 tracking-wide">
                  Create Post
                </h3>
                <p className="text-gray-400 text-base text-center max-w-[80%] mx-auto">
                  Share your photos and inspire others
                </p>
              </Link>

              <Link
                to="/search"
                className="group relative aspect-square bg-black border border-neutral-900 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4 hover:border-green-600 transition-colors cursor-pointer"
              >
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover:scale-105 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold mb-1 tracking-wide">
                  Search
                </h3>
                <p className="text-gray-400 text-base text-center max-w-[80%] mx-auto">
                  Discover amazing content from creators
                </p>
              </Link>

              <Link
                to={`/profile/${user?.username}`}
                className="group relative aspect-square bg-black border border-neutral-900 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4 hover:border-purple-600 transition-colors cursor-pointer"
              >
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover:scale-105 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold mb-1 tracking-wide">
                  Profile
                </h3>
                <p className="text-gray-400 text-base text-center max-w-[80%] mx-auto">
                  Manage your account and preferences
                </p>
              </Link>
            </div>

            {/* Sección de usuarios destacados */}
            {featuredUsers.length > 0 && (
              <div className="mt-16">
                <h2 className="text-white text-xl mb-4">Featured Users</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {featuredUsers.map(user => (
                    <UserCard key={user._id} user={user} />
                  ))}
                </div>
              </div>
            )}

            {/* Ejemplo: mostrar tu propio UserCard en el dashboard */}
            <div className="mt-16 max-w-xs mx-auto">
              <UserCard user={user} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
