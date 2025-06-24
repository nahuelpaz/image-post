import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';

const API_BASE_URL = 'http://localhost:5000/api';

const Explore = () => {
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const res = await fetch(`${API_BASE_URL}/search/tags?limit=20`);
        const data = await res.json();
        setTags(data.tags || []);
      } catch {
        setTags([]);
      }
      setLoadingTags(false);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await fetch(`${API_BASE_URL}/posts?limit=24`);
        const data = await res.json();
        setPosts(data.posts || []);
      } catch {
        setPosts([]);
      }
      setLoadingPosts(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl text-white font-semibold mb-6">Explore</h2>
        {/* Tags populares */}
        <div className="mb-8">
          <h3 className="text-white text-lg mb-3">Popular Tags</h3>
          {loadingTags ? (
            <div className="flex gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-20 h-7 bg-neutral-900 rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <Link
                  to={`/tags/${encodeURIComponent(tag.tag || tag.name || tag)}`}
                  key={i}
                  className="bg-neutral-900 text-white px-4 py-1 rounded-full text-sm font-medium shadow border border-neutral-800 tracking-wide hover:bg-blue-700 hover:text-white transition"
                >
                  #{tag.tag || tag.name || tag}
                </Link>
              ))}
            </div>
          )}
        </div>
        {/* Grilla de imágenes */}
        <div>
          <h3 className="text-white text-lg mb-3">Recent Posts</h3>
          {loadingPosts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-neutral-900 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-gray-400 text-center py-16">No posts found.</div>
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
    </div>
  );
};

export default Explore;
