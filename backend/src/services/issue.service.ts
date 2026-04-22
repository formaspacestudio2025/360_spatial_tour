import db from '../config/database';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
}

export async function createIssue(data: { title: string; description: string; status: string }): Promise<Issue> {
  const id = generateId();
  const sql = 'INSERT INTO issues (id, title, description, status) VALUES (?, ?, ?, ?)';
  await db.prepare(sql).run(id, data.title, data.description, data.status);
  return { id, ...data };
}

export async function getIssues(): Promise<Issue[]> {
  const sql = 'SELECT * FROM issues';
  const issues = await db.all(sql);
  return issues;
}
