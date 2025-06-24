import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import { ImagePlus, FileArchive, Loader2, Tag, Text, Heading1, ArrowLeft } from 'lucide-react';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [fileType, setFileType] = useState('images');
  const [images, setImages] = useState([]);
  const [zip, setZip] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFilesChange = (e) => {
    if (fileType === 'images') {
      const files = Array.from(e.target.files);
      setImages(files);
      setPreview(files.map(file => URL.createObjectURL(file)));
      setZip(null);
    } else {
      setZip(e.target.files[0]);
      setImages([]);
      setPreview([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let uploadedImages = [];
      let archiveInfo = null;

      if (fileType === 'images' && images.length > 0) {
        const res = await postService.uploadMultipleImages(images);
        uploadedImages = res.images;
      } else if (fileType === 'zip' && zip) {
        const res = await postService.uploadArchive(zip);
        uploadedImages = res.images;
        archiveInfo = res.archiveInfo;
      }

      const post = await postService.createPost({
        title,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        images: uploadedImages,
        archiveInfo,
      });

      // Redirige al detalle del post recién creado
      navigate(`/post/${post.post?._id || post._id}`);
    } catch (err) {
      setError(err.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-xl font-medium text-white tracking-wide flex items-center gap-2">
          <ImagePlus className="w-6 h-6 text-blue-500" />
          Create New Post
        </h2>
      </div>

      <div className="w-full max-w-3xl mx-auto mt-12 mb-20 bg-black border border-neutral-900 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all">
        {/* Form section */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col justify-center p-12 gap-8 bg-black"
          style={{ minWidth: 340 }}
        >
          {/* Title */}
          <div>
            <label className="block text-gray-300 mb-1 font-medium flex items-center gap-2">
              <Heading1 className="w-4 h-4 text-blue-400" />
              Title
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-10 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-800 focus:border-blue-500 outline-none transition"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                maxLength={100}
                placeholder="Give your post a catchy title"
              />
              <Heading1 className="absolute left-3 top-2.5 w-4 h-4 text-blue-400 pointer-events-none" />
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="block text-gray-300 mb-1 font-medium flex items-center gap-2">
              <Text className="w-4 h-4 text-green-400" />
              Description
            </label>
            <div className="relative">
              <textarea
                className="w-full px-10 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-800 focus:border-blue-500 outline-none transition resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Describe your post (optional)"
              />
              <Text className="absolute left-3 top-2.5 w-4 h-4 text-green-400 pointer-events-none" />
            </div>
          </div>
          {/* Tags */}
          <div>
            <label className="block text-gray-300 mb-1 font-medium flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              Tags
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-10 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-800 focus:border-blue-500 outline-none transition"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g. nature, travel, art"
              />
              <Tag className="absolute left-3 top-2.5 w-4 h-4 text-purple-400 pointer-events-none" />
            </div>
          </div>
          {/* Upload Type */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Upload Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  fileType === 'images'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-neutral-900 border-neutral-800 text-gray-300 hover:bg-neutral-800'
                }`}
                onClick={() => setFileType('images')}
              >
                <ImagePlus className="w-4 h-4" />
                Images
              </button>
              <button
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  fileType === 'zip'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-neutral-900 border-neutral-800 text-gray-300 hover:bg-neutral-800'
                }`}
                onClick={() => setFileType('zip')}
              >
                <FileArchive className="w-4 h-4" />
                ZIP Archive
              </button>
            </div>
          </div>
          {/* File input */}
          <div>
            <label className="block text-gray-300 mb-1 font-medium">
              {fileType === 'images' ? 'Select Images' : 'Select ZIP File'}
            </label>
            <input
              type="file"
              accept={fileType === 'images' ? 'image/*' : '.zip,application/zip'}
              multiple={fileType === 'images'}
              onChange={handleFilesChange}
              required
              className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <div className="mb-2 text-gray-400 text-xs font-medium">Preview</div>
              <div className="flex gap-2 flex-wrap rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                {preview.map((src, i) => (
                  <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 flex items-center justify-center">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Error */}
          {error && (
            <div className="text-red-500 bg-red-900/30 border border-red-800 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          )}
          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
