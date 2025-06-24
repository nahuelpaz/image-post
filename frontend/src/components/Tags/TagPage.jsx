import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../layout/Navbar';
import { ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const TagPage = () => {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/search/posts?tags=${encodeURIComponent(tag)}`);
        const data = await res.json();
        setPosts(data.posts || []);
      } catch {
        setPosts([]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [tag]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl text-white font-semibold">
            Posts with tag <span className="text-blue-400">#{tag}</span>
          </h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-gray-400 text-center py-16">No posts found for this tag.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {posts.map(post => (
              <Link
                to={`/post/${post._id}`}
                key={post._id}
                className="group relative aspect-square bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg overflow-hidden flex flex-col hover:border-blue-600 transition-colors"
              >
                <img
                  src={post.images?.[0]?.url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  style={{ minHeight: 0, minWidth: 0 }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    {post.author?.avatar && (
                      <img
                        src={post.author.avatar}
                        alt={post.author.username}
                        className="w-6 h-6 rounded-full object-cover border border-neutral-700"
                      />
                    )}
                    <span className="text-white text-xs font-medium truncate">{post.author?.username}</span>
                  </div>
                  <div className="text-white text-base font-semibold truncate mb-1">{post.title}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {post.tags?.map((t, i) => (
                      <span key={i} className="bg-neutral-800 text-white px-2 py-0.5 rounded-full text-xs">#{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagPage;
