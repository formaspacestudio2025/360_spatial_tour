import { db } from '../database';
import { Issue, CreateIssueData } from '../types/issue';

export class IssueService {
  /**
   * Create a new issue
   */
  async create(data: CreateIssueData): Promise<Issue> {
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO issues (id, title, description, status, priority)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.title, data.description, data.status, data.priority);
    return { id, ...data };
  }

  /**
   * Update an issue
   */
  async update(id: string, data: Partial<Issue>): Promise<Issue> {
    const stmt = db.prepare(`
      UPDATE issues SET 
        title = ?,
        description = ?,
        status = ?,
        priority = ?
      WHERE id = ?
    `);
    stmt.run(data.title, data.description, data.status, data.priority, id);
    return { ...data, id };
  }

  /**
   * Delete an issue
   */
  async delete(id: string): Promise<void> {
    const stmt = db.prepare('DELETE FROM issues WHERE id = ?');
    stmt.run(id);
  }

  /**
   * List all issues
   */
  async list(): Promise<Issue[]> {
    const stmt = db.prepare('SELECT * FROM issues');
    return stmt.all() as Issue[];
  }
}
