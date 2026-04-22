import { useState, useRef, useEffect, useCallback } from 'react';
import { HotspotMedia, hotspotMediaApi } from '@/api/hotspot-media';
import {
  Upload,
  X,
  Image,
  Video,
  FileText,
  Music,
  File,
  Eye,
  Download,
  Copy,
  Trash2,
  GripVertical,
  Check,
  Loader2,
  Grid3X3,
  List,
  Search,
} from 'lucide-react';

interface MediaManagerProps {
  hotspotId: string;
  onClose: () => void;
}

// Helper to format file size
function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Helper to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Helper to get file icon
function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'image':
      return <Image size={16} className="text-purple-400" />;
    case 'video':
      return <Video size={16} className="text-pink-400" />;
    case 'audio':
      return <Music size={16} className="text-indigo-400" />;
    case 'pdf':
      return <FileText size={16} className="text-red-400" />;
    default:
      return <File size={16} className="text-gray-400" />;
  }
}

export default function MediaManager({ hotspotId, onClose }: MediaManagerProps) {
  const [media, setMedia] = useState<HotspotMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load media
  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const data = await hotspotMediaApi.getByHotspot(hotspotId);
      setMedia(data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  }, [hotspotId]);

  // Load on mount
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle file upload
  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      console.log('[MediaManager] ========== UPLOAD START ==========');
      console.log('[MediaManager] hotspotId:', hotspotId);
      console.log('[MediaManager] Files:', fileArray.map(f => ({ name: f.name, size: f.size, type: f.type })));
      console.log('[MediaManager] Uploading files:', fileArray.map(f => f.name));
      const uploaded = await hotspotMediaApi.uploadFiles(hotspotId, fileArray);
      console.log('[MediaManager] Upload successful:', uploaded);
      setMedia(prev => [...prev, ...uploaded]);
      alert(`Successfully uploaded ${uploaded.length} file(s)`);
    } catch (error: any) {
      console.error('[MediaManager] ========== UPLOAD FAILED ==========');
      console.error('[MediaManager] Error:', error);
      console.error('[MediaManager] Response:', error.response);
      console.error('[MediaManager] Data:', error.response?.data);
      console.error('[MediaManager] Status:', error.response?.status);
      
      const message = error.response?.data?.message || error.message || 'Failed to upload files';
      alert(`Upload failed: ${message}\n\nStatus: ${error.response?.status || 'Unknown'}\n\nCheck browser console for details.`);
    } finally {
      setUploading(false);
    }
  };

  // Handle drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  // Delete media
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media file?')) return;

    try {
      await hotspotMediaApi.delete(id);
      setMedia(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected files?`)) return;

    try {
      const result = await hotspotMediaApi.bulkDelete(Array.from(selectedIds));
      setMedia(prev => prev.filter(m => !selectedIds.has(m.id)));
      setSelectedIds(new Set());
      alert(`Deleted ${result.deleted} file(s)`);
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter media by search
  const filteredMedia = media.filter(m =>
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.file_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = {
    total: media.length,
    images: media.filter(m => m.file_type === 'image').length,
    videos: media.filter(m => m.file_type === 'video').length,
    documents: media.filter(m => m.file_type === 'pdf' || m.file_type === 'document').length,
    audio: media.filter(m => m.file_type === 'audio').length,
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          title="Close"
        >
          <X size={20} className="text-white" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Media Manager</h2>
            <p className="text-sm text-gray-400 mt-1">
              {stats.total} files • {stats.images} images • {stats.videos} videos • {stats.documents} docs
            </p>
          </div>
        </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* View mode toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700' : ''}`}
          >
            <List size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700' : ''}`}
          >
            <Grid3X3 size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Bulk delete */}
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            Delete ({selectedIds.size})
          </button>
        )}

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Drop zone & content */}
      <div
        className="flex-1 overflow-auto p-4"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {dragActive && (
          <div className="absolute inset-0 bg-primary-600/20 border-2 border-dashed border-primary-500 rounded-lg flex items-center justify-center z-50">
            <div className="text-center">
              <Upload size={48} className="mx-auto mb-4 text-primary-400" />
              <p className="text-xl font-semibold text-white">Drop files here</p>
              <p className="text-sm text-gray-300 mt-2">Upload up to 20 files at once</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-primary-400" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Upload size={48} className="text-gray-600 mb-4" />
            <p className="text-lg font-semibold text-gray-400">No media files</p>
            <p className="text-sm text-gray-500 mt-2">Upload files to get started</p>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-2">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-3 bg-gray-800/50 border rounded-lg transition-colors ${
                  selectedIds.has(item.id)
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="w-4 h-4 rounded border-gray-600"
                />

                {/* Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(item.file_type)}
                </div>

                {/* Thumbnail */}
                {item.file_type === 'image' && item.file_url && (
                  <img
                    src={item.file_url}
                    alt={item.title || 'Image'}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {item.title || item.file_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.file_type.toUpperCase()} • {formatFileSize(item.file_size)} • {formatDate(item.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {item.file_url && item.file_type === 'image' && (
                    <button
                      onClick={() => setPreviewUrl(item.file_url!)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} className="text-gray-400" />
                    </button>
                  )}
                  {item.file_url && (
                    <a
                      href={item.file_url}
                      download
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={16} className="text-gray-400" />
                    </a>
                  )}
                  {item.file_url && (
                    <button
                      onClick={() => handleCopyUrl(item.id, item.file_url!)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-gray-400" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className={`bg-gray-800/50 border rounded-lg overflow-hidden transition-colors ${
                  selectedIds.has(item.id)
                    ? 'border-primary-500'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                  {item.file_type === 'image' && item.file_url ? (
                    <img
                      src={item.file_url}
                      alt={item.title || 'Image'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getFileIcon(item.file_type)
                  )}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="absolute top-2 left-2 w-4 h-4 rounded border-gray-600"
                  />
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs font-medium text-white truncate">
                    {item.title || item.file_name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {formatFileSize(item.file_size)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-2">
                    {item.file_url && item.file_type === 'image' && (
                      <button
                        onClick={() => setPreviewUrl(item.file_url!)}
                        className="flex-1 p-1.5 hover:bg-gray-700 rounded transition-colors"
                        title="Preview"
                      >
                        <Eye size={14} className="text-gray-400" />
                      </button>
                    )}
                    {item.file_url && (
                      <a
                        href={item.file_url}
                        download
                        className="flex-1 p-1.5 hover:bg-gray-700 rounded transition-colors"
                        title="Download"
                      >
                        <Download size={14} className="text-gray-400" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 p-1.5 hover:bg-red-600/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-8">
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg"
          >
            <X size={24} className="text-white" />
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
      </div>
    </div>
  );
}
