import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditIssueStatus from '../EditIssueStatus';

// Mock the issuesApi module
vi.mock('../../../api/issuesApi', () => ({
  issuesApi: {
    uploadResolution: vi.fn().mockResolvedValue({ success: true, data: {} }),
    update: vi.fn().mockResolvedValue({ success: true, data: {} }),
  }
}));

describe('EditIssueStatus', () => {
  it('shows file input when status is set to resolved', async () => {
    render(
      <EditIssueStatus
        apiUrl="/api/issues"
        issueId="test-id"
        currentStatus="open"
        onStatusChange={() => {}}
      />
    );

    // Status select should be in document
    expect(screen.getByLabelText(/Status:/i)).toBeInTheDocument();

    // Change status to resolved
    fireEvent.change(screen.getByLabelText(/Status:/i), { target: { value: 'resolved' } });

    // The file input should appear when status is resolved
    const fileInput = screen.getByLabelText(/Resolution Proof Image:/i);
    expect(fileInput).toBeInTheDocument();
  });

  it('renders with current status', () => {
    render(
      <EditIssueStatus
        apiUrl="/api/issues"
        issueId="test-id"
        currentStatus="resolved"
        resolutionImageUrl="http://example.com/image.jpg"
        resolvedAt="2024-01-01T00:00:00Z"
        onStatusChange={() => {}}
      />
    );

    // Should show the resolution image
    const img = screen.getByAltText(/Resolution proof/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://example.com/image.jpg');
  });
});
