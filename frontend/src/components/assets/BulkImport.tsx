import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface BulkImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setResult(null);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/assets/import`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult({
          created: data.data.created,
          errors: data.data.errors || [],
        });
        onSuccess();
      } else {
        setError(data.message || 'Import failed');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'name,type,brand,model,serial_number,status,walkthrough_id,purchase_date,warranty_date\n' +
      'Example Asset,HVAC,Brand X,Model Y,SN123,active,walk_001,2024-01-15,2029-01-15';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Bulk Import Assets</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Template Download */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Need a template?</p>
          <button
            onClick={downloadTemplate}
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-2"
          >
            <Download size={14} />
            Download CSV Template
          </button>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload size={32} className="text-gray-500" />
              <span className="text-sm text-gray-400">
                {file ? file.name : 'Click to upload CSV file'}
              </span>
              <span className="text-xs text-gray-500">Max 5MB</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-4 space-y-2">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-green-400 text-sm">
                Successfully imported {result.created} assets
              </span>
            </div>
            {result.errors.length > 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">
                    {result.errors.length} Errors
                  </span>
                </div>
                <ul className="text-xs text-gray-400 space-y-1">
                  {result.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg disabled:opacity-50 text-sm"
          >
            {uploading ? 'Uploading...' : 'Import'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImport;
