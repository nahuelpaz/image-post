import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import PostImages from './PostDetail/PostImages';
import PostInfo from './PostDetail/PostInfo';
import PostComments from './PostDetail/PostComments';

const API_BASE_URL = 'http://localhost:5000/api';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [error, setError] = useState('');
  // Comentario
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  // Determina si el usuario actual ya dio like
  const isLiked = user && post?.likes?.some(like => {
    if (typeof like === 'object' && like.user) {
      return like.user === user._id || like.user === user.id;
    }
    return like === user._id || like === user.id;
  });

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
          headers: localStorage.getItem('token')
            ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
            : {},
        });
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        setPost(data.post);
      } catch (err) {
        setError(err.message || 'Error loading post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    setActiveImage(0); // Reset to first image when post changes
  }, [post?._id]);

  const handleLike = async () => {
    if (!post || !user) return;
    setLikeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/${post._id}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        // Recarga el post para actualizar likes y mantener la lógica, pero sin sumar view
        const updated = await fetch(`${API_BASE_URL}/posts/${post._id}?countView=false`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (updated.ok) {
          const updatedData = await updated.json();
          setPost(updatedData.post);
        }
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommentLoading(true);
    setCommentError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/comments/${post._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: comment }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add comment');
      }
      setComment('');
      // Recarga comentarios sin sumar view
      const updated = await fetch(`${API_BASE_URL}/posts/${post._id}?countView=false`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (updated.ok) {
        const updatedData = await updated.json();
        setPost(updatedData.post);
      }
    } catch (err) {
      setCommentError(err.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // Descargar imagen individual
  const handleDownloadImage = async (img) => {
    const response = await fetch(img.url);
    const blob = await response.blob();
    const ext = img.format ? `.${img.format}` : '';
    saveAs(blob, img.filename || `image${ext}`);
  };

  // Descargar todas las imágenes como ZIP
  const handleDownloadAll = async () => {
    if (!post.images || post.images.length === 0) return;
    const zip = new JSZip();
    // Descarga cada imagen y la agrega al zip
    await Promise.all(
      post.images.map(async (img, idx) => {
        const response = await fetch(img.url);
        const blob = await response.blob();
        const ext = img.format ? `.${img.format}` : '';
        zip.file(img.filename || `image${idx + 1}${ext}`, blob);
      })
    );
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${post.title?.replace(/\s+/g, '_') || 'images'}.zip`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-black">
        <h2 className="text-2xl font-medium text-white mb-2 tracking-widest">Post not found</h2>
        <p className="text-gray-500">{error || 'This post does not exist.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-neutral-900 text-white rounded-lg border border-neutral-800 hover:bg-neutral-800 transition font-medium tracking-widest"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur border-b border-neutral-900 flex items-center px-10 py-6 w-full max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mr-6 text-gray-400 hover:text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
        <h2 className="text-xl font-medium text-white tracking-wide">
          Post
        </h2>
      </div>

      <div className="w-full max-w-7xl mx-auto mt-12 mb-20 bg-black border border-neutral-900 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all">
        <PostImages
          images={post.images}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          handleDownloadImage={handleDownloadImage}
        />
        <div className="md:w-[30%] flex flex-col p-12 gap-8 bg-black">
          <PostInfo
            post={post}
            user={user}
            isLiked={isLiked}
            likeLoading={likeLoading}
            handleLike={handleLike}
            handleDownloadAll={handleDownloadAll}
          />
          <PostComments
            post={post}
            user={user}
            comment={comment}
            setComment={setComment}
            commentLoading={commentLoading}
            commentError={commentError}
            handleCommentSubmit={handleCommentSubmit}
          />
        </div>
      </div>
    </div>
  );
};


export default PostDetail;
