import { resolveIssue } from '../issue.service';
import db from '../../config/database';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    prepare: jest.fn(),
  },
  generateId: () => 'test-id-123',
}));

describe('resolveIssue', () => {
  it('should update issue with resolution image url and resolved_at timestamp', async () => {
    const mockGet = jest.fn().mockReturnValue({
      id: 'issue-1',
      status: 'open',
      resolution_image_url: null,
      resolved_at: null,
    });
    const mockRun = jest.fn();
    (db.prepare as jest.Mock).mockImplementation((sql: string) => {
      if (sql.startsWith('SELECT')) return { get: mockGet };
      if (sql.startsWith('UPDATE')) return { run: mockRun };
      return { get: jest.fn(), run: jest.fn() };
    });

    const result = await resolveIssue('issue-1', 'http://example.com/proof.jpg');

    expect(result).toBeDefined();
    expect(result?.resolution_image_url).toBe('http://example.com/proof.jpg');
    expect(result?.resolved_at).toBeDefined();
    expect(result?.status).toBe('resolved');
    expect(mockRun).toHaveBeenCalled();
  });

  it('should return null if issue not found', async () => {
    const mockGet = jest.fn().mockReturnValue(null);
    (db.prepare as jest.Mock).mockImplementation((sql: string) => {
      if (sql.startsWith('SELECT')) return { get: mockGet };
      return { get: jest.fn(), run: jest.fn() };
    });

    const result = await resolveIssue('non-existent', 'http://example.com/img.jpg');

    expect(result).toBeNull();
  });
});
