import React, { useState } from 'react';
import axios from 'axios';

interface CreateIssueFormProps {
  apiUrl: string;
  walkthroughId: string;
  sceneId: string;
}

const CreateIssueForm: React.FC<CreateIssueFormProps> = ({ apiUrl, walkthroughId, sceneId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom'>('maintenance');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.post(apiUrl, {
        walkthrough_id: walkthroughId,
        scene_id: sceneId,
        title,
        description,
        type,
        severity
      });
      setTitle('');
      setDescription('');
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
      <button type="submit">Create Issue</button>
    </form>
  );
};

export default CreateIssueForm;
