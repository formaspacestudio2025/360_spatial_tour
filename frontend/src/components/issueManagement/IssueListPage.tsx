import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Issue } from '../types'; // Assuming you have a type definition for Issue

interface IssueListPageProps {
  apiUrl: string;
}

const IssueListPage: React.FC<IssueListPageProps> = ({ apiUrl }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get(apiUrl);
        setIssues(response.data);
      } catch (error) {
        console.error('Error fetching issues:', error);
        setError('Failed to fetch issues. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [apiUrl]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1>Issue List</h1>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id}>
            {issue.title} - {issue.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IssueListPage;
