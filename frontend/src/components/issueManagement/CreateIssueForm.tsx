import React, { useState } from 'react';
import { issuesApi } from '@/api/issuesApi';

interface CreateIssueFormProps {
  walkthroughId: string;
  sceneId: string;
  yaw?: number;
  pitch?: number;
  floor?: number;
  room?: string;
}

const CreateIssueForm: React.FC<CreateIssueFormProps> = ({ walkthroughId, sceneId, yaw, pitch, floor, room }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom'>('maintenance');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // Create issue with optional spatial fields
      const issue = await issuesApi.create({
        walkthrough_id: walkthroughId,
        scene_id: sceneId,
        yaw: (typeof yaw === 'number' ? yaw : undefined) as any,
        pitch: (typeof pitch === 'number' ? pitch : undefined) as any,
        floor,
        room,
        title,
        description,
        type,
        severity,
        // priority can be added later if needed
      });

      // Upload attachment if provided
      if (attachmentFile) {
        await issuesApi.uploadAttachment(issue.data.id, attachmentFile);
      }

      // Reset form fields
      setTitle('');
      setDescription('');
      setAttachmentFile(null);
      setError(null);
      setSuccessMessage('Issue created successfully!');
    } catch (error) {
      console.error('Error creating issue:', error);
      setError('Failed to create issue. Please try again.');
      setSuccessMessage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="type">Type:</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="damage">Damage</option>
          <option value="safety">Safety</option>
          <option value="maintenance">Maintenance</option>
          <option value="compliance">Compliance</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div>
        <label htmlFor="severity">Severity:</label>
        <select id="severity" value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div>
            <label htmlFor="attachment">Attachment (optional):</label>
            <input type="file" id="attachment" onChange={(e) => setAttachmentFile(e.target.files && e.target.files[0] || null)} />
          </div>
          <button type="submit">Create Issue</button>
    </form>
  );
};

export default CreateIssueForm;
