import React, { useState } from 'react';
import { issuesApi } from '../../api/issuesApi';

interface EditIssueStatusProps {
  apiUrl: string;
  issueId: string;
  currentStatus: string;
  resolutionImageUrl?: string;
  resolvedAt?: string;
  onStatusChange?: (newStatus: string) => void;
}

const EditIssueStatus: React.FC<EditIssueStatusProps> = ({ apiUrl, issueId, currentStatus, resolutionImageUrl, resolvedAt, onStatusChange }) => {
  const [status, setStatus] = useState<'open' | 'in_progress' | 'resolved' | 'closed'>(currentStatus as any);
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (status === 'resolved' && resolutionFile) {
        setUploading(true);
        await issuesApi.uploadResolution(issueId, resolutionFile);
        setUploading(false);
      } else {
        await issuesApi.update(issueId, { status });
      }
      onStatusChange?.(status);
    } catch (error) {
      console.error('Error updating issue status:', error);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="status">Status:</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'open' | 'in_progress' | 'resolved' | 'closed')}
          required
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {status === 'resolved' && (
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="resolution-image">Resolution Proof Image:</label>
          <input
            id="resolution-image"
            type="file"
            accept="image/*"
            onChange={(e) => setResolutionFile(e.target.files?.[0] || null)}
            required={status === 'resolved'}
          />
          {resolutionImageUrl && (
            <div style={{ marginTop: '0.5rem' }}>
              <p>Current resolution proof:</p>
              <img src={resolutionImageUrl} alt="Resolution proof" style={{ maxWidth: '200px' }} />
              {resolvedAt && <p>Resolved at: {new Date(resolvedAt).toLocaleString()}</p>}
            </div>
          )}
        </div>
      )}

      <button type="submit" disabled={uploading} style={{ marginTop: '1rem' }}>
        {uploading ? 'Uploading...' : 'Update Status'}
      </button>
    </form>
  );
};

export default EditIssueStatus;
