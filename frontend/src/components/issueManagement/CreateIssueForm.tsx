import React, { useState } from 'react';
import axios from 'axios';

interface CreateIssueFormProps {
  apiUrl: string;
}

const CreateIssueForm: React.FC<CreateIssueFormProps> = ({ apiUrl }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.post(apiUrl, { title, description });
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
          required
        />
      </div>
      <button type="submit">Create Issue</button>
    </form>
  );
};

export default CreateIssueForm;
