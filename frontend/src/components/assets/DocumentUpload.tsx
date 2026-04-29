import { useState } from 'react';
import { Upload, FileText, Trash2, Download, File } from 'lucide-react';
import { assetsApi } from '@/api/assetsApi';

interface DocumentUploadProps {
  assetId: string;
  documents: Array<{
    filename: string;
    originalname: string;
    size: number;
    uploaded_at: string;
    mimetype: string;
  }>;
  onUpdate: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ assetId, documents, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/assets/${assetId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (filename: string, originalname: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/assets/${assetId}/documents/${filename}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalname;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Download failed: ' + err.message);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm('Delete this document?')) return;

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/assets/${assetId}/documents/${filename}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      onUpdate();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
        <input
          type="file"
          id={`file-upload-${assetId}`}
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label
          htmlFor={`file-upload-${assetId}`}
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload size={24} className="text-gray-400" />
          <span className="text-sm text-gray-400">
            {uploading ? 'Uploading...' : 'Click to upload document'}
          </span>
          <span className="text-xs text-gray-500">Max 50MB</span>
        </label>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Document List */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">Documents ({documents.length})</h4>
          {documents.map((doc) => (
            <div
              key={doc.filename}
              className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded">
                  <File size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white">{doc.originalname}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(doc.size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(doc.filename, doc.originalname)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => handleDelete(doc.filename)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No documents uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
