import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scenesApi } from '@/api/scenes';
import { Upload, X, Image, Loader2, Trash2 } from 'lucide-react';

interface BulkUploadProps {
  walkthroughId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UploadFile {
  file: File;
  preview: string;
  roomName: string;
  floor: string;
  notes: string;
}

function BulkUpload({ walkthroughId, isOpen, onClose }: BulkUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => scenesApi.upload(walkthroughId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes', walkthroughId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setFiles([]);
      onClose();
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.match(/image\/(jpeg|jpg|png)/)
    );

    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploads: UploadFile[] = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      roomName: '',
      floor: '1',
      notes: '',
    }));
    setFiles((prev) => [...prev, ...uploads]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateFile = (index: number, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const handleUpload = () => {
    if (files.length === 0) return;

    const formData = new FormData();

    // Append all files
    files.forEach((uf) => {
      formData.append('images', uf.file);
    });

    // Append metadata as JSON maps indexed by array position
    const roomNames: Record<string, string> = {};
    const floors: Record<string, string> = {};
    const notesList: Record<string, string> = {};

    files.forEach((uf, i) => {
      roomNames[i] = uf.roomName;
      floors[i] = uf.floor;
      notesList[i] = uf.notes;
    });

    formData.append('room_names', JSON.stringify(roomNames));
    formData.append('floors', JSON.stringify(floors));
    formData.append('notes', JSON.stringify(notesList));

    uploadMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Upload Scenes</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drop zone */}
        <div className="p-5">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
            }`}
          >
            <Upload size={32} className="mx-auto mb-3 text-gray-500" />
            <p className="text-white font-medium mb-1">
              Drag & drop 360 images here
            </p>
            <p className="text-gray-500 text-sm">
              or click to browse (JPG, PNG)
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-5 space-y-3 max-h-64 overflow-y-auto">
              {files.map((uf, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-gray-800/50 border border-gray-800 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={uf.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">
                        Room Name
                      </label>
                      <input
                        type="text"
                        value={uf.roomName}
                        onChange={(e) =>
                          updateFile(index, { roomName: e.target.value })
                        }
                        placeholder="e.g. Lobby"
                        className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">
                        Floor
                      </label>
                      <input
                        type="number"
                        value={uf.floor}
                        onChange={(e) =>
                          updateFile(index, { floor: e.target.value })
                        }
                        className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={uf.notes}
                        onChange={(e) =>
                          updateFile(index, { notes: e.target.value })
                        }
                        placeholder="Optional notes"
                        className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0 self-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-800">
          <span className="text-sm text-gray-500">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              disabled={uploadMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploadMutation.isPending}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Image size={16} />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkUpload;
