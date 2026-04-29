import React, { useState } from 'react';
import axios from 'axios';

interface EditIssueStatusProps {
  apiUrl: string;
  issueId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

const EditIssueStatus: React.FC<EditIssueStatusProps> = ({ apiUrl, issueId, currentStatus, onStatusChange }) => {
  const [status, setStatus] = useState<'open' | 'in_progress' | 'resolved' | 'closed'>(currentStatus as any);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.put(`${apiUrl}/${issueId}`, { status });
      onStatusChange?.(status);
    } catch (error) {
      console.error('Error updating issue status:', error);
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
      <button type="submit">Update Status</button>
    </form>
  );
};

export default EditIssueStatus;
