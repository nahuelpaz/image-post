import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, ArrowLeft, Loader2, User, Send, ChevronLeft, ChevronRight, Download, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import EditTextModal from './EditTextModal';
import PostImages from './PostDetail/PostImages';
import PostInfo from './PostDetail/PostInfo';
import PostComments from './PostDetail/PostComments';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', tags: '' });
  const [editError, setEditError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const menuRef = useRef();

  // Determina si el usuario actual ya dio like
  const isLiked = user && post?.likes?.some(like => {
    if (typeof like === 'object' && like.user) {
      return like.user === user._id || like.user === user.id;
    }
    return like === user._id || like === user.id;
  });

  // Helper para comparar IDs como string
  const isAuthor = user && post?.author && (
    String(post.author._id || post.author.id) === String(user._id || user.id)
  );

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

  const handleEditClick = () => {
    setEditData({
      title: post.title || '',
      description: post.description || '',
      tags: (post.tags || []).join(', ')
    });
    setEditError('');
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleEditFieldChange = (name, value) => {
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editData.title,
          description: editData.description,
          tags: editData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update post');
      }
      const updated = await res.json();
      setPost(updated.post);
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update post');
    }
  };

  // Borrar post con confirmación modal
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete post');
      }
      navigate('/');
    } catch (err) {
      alert(err.message || 'Failed to delete post');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Borrar comentario con confirmación modal
  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/comments/${post._id}/${deleteCommentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete comment');
      }
      
      // Obtener el post actualizado con comentarios populados desde la respuesta
      const result = await res.json();
      if (result.post) {
        setPost(result.post);
      } else {
        // Fallback: recarga comentarios sin sumar view
        const updated = await fetch(`${API_BASE_URL}/posts/${post._id}?countView=false`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (updated.ok) {
          const updatedData = await updated.json();
          setPost(updatedData.post);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    } finally {
      setDeleteLoading(false);
      setDeleteCommentId(null);
    }
  };

  // Cierra el menú si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full text-center bg-black">
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
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur border-b border-neutral-900 flex items-center px-4 md:px-6 lg:px-8 xl:px-10 py-4 md:py-6 w-full max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 md:mr-6 text-gray-400 hover:text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 md:w-7 md:h-7" />
        </button>
        <h2 className="text-lg md:text-xl font-medium text-white tracking-wide">
          Post
        </h2>
      </div>

      <div className="w-full max-w-7xl mx-4 md:mx-auto mt-6 md:mt-8 lg:mt-12 mb-12 md:mb-16 lg:mb-20 bg-black border border-neutral-900 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all">
        <PostImages
          images={post.images}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          handleDownloadImage={handleDownloadImage}
          authorUsername={post.author?.username}
          postTitle={post.title}
        />
        <div className="md:w-[45%] lg:w-[40%] xl:w-[35%] 2xl:w-[30%] flex flex-col p-6 md:p-8 lg:p-10 xl:p-12 gap-6 md:gap-8 bg-black">
          <PostInfo
            post={post}
            user={user}
            isAuthor={isAuthor}
            menuRef={menuRef}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            handleEditClick={handleEditClick}
            handleDeleteClick={() => setShowDeleteModal(true)}
            handleDownloadAll={handleDownloadAll}
            isLiked={isLiked}
            likeLoading={likeLoading}
            handleLike={handleLike}
          />
          <PostComments
            post={post}
            user={user}
            comment={comment}
            setComment={setComment}
            commentLoading={commentLoading}
            commentError={commentError}
            handleCommentSubmit={handleCommentSubmit}
            onDeleteComment={commentId => setDeleteCommentId(commentId)}
            isPostAuthor={isAuthor}
          />
        </div>
      </div>
      {/* Modal para editar post */}
      {showEditModal && (
        <EditTextModal
          title="Edit Post"
          fields={[
            { name: 'title', label: 'Title', maxLength: 100, required: true },
            { name: 'description', label: 'Description', type: 'textarea', maxLength: 500 },
            { name: 'tags', label: 'Tags (comma separated)', maxLength: 100 }
          ]}
          values={editData}
          onChange={handleEditFieldChange}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          loading={false}
          error={editError}
          submitLabel="Save"
        />
      )}
      {/* Modal de confirmación para borrar post */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
      {/* Modal de confirmación para borrar comentario */}
      <ConfirmDeleteModal
        open={!!deleteCommentId}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setDeleteCommentId(null)}
        onConfirm={handleDeleteComment}
        loading={deleteLoading}
      />
    </div>
  );
};

export default PostDetail;

