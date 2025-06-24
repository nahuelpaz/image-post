import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import UserCard from './UserCard';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      // Buscar usuarios
      const usersRes = await fetch(
        `http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`
      );
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);
    } catch (err) {
      setUsers([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="mb-8 flex justify-center">
          <input
            type="text"
            className="w-full max-w-xl px-4 py-2 rounded-l-lg bg-[#18181b] text-white border border-gray-700 focus:outline-none"
            placeholder="Search users..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-r-lg bg-white text-black font-semibold hover:bg-gray-200 transition"
          >
            Search
          </button>
        </form>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {users.length > 0 ? (
              <div className="mb-8">
                <h2 className="text-white text-xl mb-4">Users</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {users.map(user => (
                    <Link to={`/profile/${user.username}`} className="block group" key={user._id}>
                      <UserCard user={user} />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              searched && (
                <div className="col-span-full text-center text-gray-400 py-16">
                  No results found.
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};



export default SearchPage;
