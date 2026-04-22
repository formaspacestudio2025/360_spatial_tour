import React, { useState } from 'react';
import axios from 'axios';

interface CreateIssueFormProps {
  apiUrl: string;
}

const CreateIssueForm: React.FC<CreateIssueFormProps> = ({ apiUrl }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.post(apiUrl, { title, description });
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
