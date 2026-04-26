import db from '../config/database';
import { generateId } from '../utils/generateId';

export interface IssueHistory {
  id: string;
  action: string;
  user_id?: string;
  timestamp: string;
  details?: string;
}

export interface IssueComment {
  id: string;
  user_id: string;
  user_name: string;
  body: string;
  timestamp: string;
  attachments?: string[];
}

export interface IssueAttachment {
  id: string;
  issue_id: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface Issue {
  id: string;
  walkthrough_id: string;
  scene_id: string;
  yaw: number;
  pitch: number;
  floor?: number;
  room?: string;
  type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'pending_approval' | 'resolved' | 'verified' | 'closed' | 'reopened';
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  resolution_proof_url?: string;
  history?: IssueHistory[];
  comments?: IssueComment[];
  attachments?: IssueAttachment[];
  created_at: string;
  updated_at: string;
}

export async function createIssue(data: {
  walkthrough_id: string;
  scene_id: string;
  yaw: number;
  pitch: number;
  floor?: number;
  room?: string;
  type: 'damage' | 'safety' | 'maintenance' | 'compliance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  attachments?: IssueAttachment[];
}): Promise<Issue> {
  const id = generateId();
  const now = new Date().toISOString();

  const initialHistory: IssueHistory[] = [{
    id: generateId(),
    action: 'created',
    timestamp: now,
    details: 'Issue created'
  }];

  const priority = data.priority || data.severity;

  const sql = `INSERT INTO issues (id, walkthrough_id, scene_id, yaw, pitch, floor, room, type, severity, priority, status, title, description, assigned_to, due_date, history, comments, attachments, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await db.prepare(sql).run(
    id, data.walkthrough_id, data.scene_id, data.yaw, data.pitch, data.floor || null, data.room || null,
    data.type, data.severity, priority, 'open', data.title, data.description || '', data.assigned_to || null, data.due_date || null, initialHistory, [], data.attachments || [], now, now
  );

  return {
    id,
    ...data,
    priority,
    status: 'open',
    history: initialHistory,
    assigned_to: data.assigned_to || undefined,
    due_date: data.due_date || undefined,
    comments: [],
    attachments: data.attachments || [],
    created_at: now,
    updated_at: now
  };
}

export async function getIssues(): Promise<Issue[]> {
  const sql = 'SELECT * FROM issues ORDER BY created_at DESC';
  const stmt = db.prepare(sql);
  const issues = await stmt.all();
  return issues;
}

export async function updateIssue(id: string, data: Partial<Issue>): Promise<Issue | null> {
  const now = new Date().toISOString();
  const existing = await db.prepare('SELECT * FROM issues WHERE id = ?').get(id);
  if (!existing) return null;

  // Record history if status or assignment changes
  const newHistoryEntry: IssueHistory | null = (() => {
    const details = [];
    if (data.status && data.status !== existing.status) details.push(`Status changed to ${data.status}`);
    if (data.assigned_to !== undefined && data.assigned_to !== existing.assigned_to) {
      details.push(data.assigned_to ? `Assigned to ${data.assigned_to}` : 'Unassigned');
    }
    if (data.priority && data.priority !== existing.priority) details.push(`Priority changed to ${data.priority}`);

    if (details.length > 0) {
      return {
        id: generateId(),
        action: 'updated',
        timestamp: now,
        details: details.join(', ')
      };
    }
    return null;
  })();

  const history = existing.history || [];
  if (newHistoryEntry) history.push(newHistoryEntry);

  const updated = { ...existing, ...data, history, updated_at: now };

  const sql = `UPDATE issues SET
                walkthrough_id = ?, scene_id = ?, yaw = ?, pitch = ?,
                floor = ?, room = ?, type = ?, severity = ?, priority = ?,
                status = ?, title = ?, description = ?, assigned_to = ?, due_date = ?, resolution_proof_url = ?, history = ?, comments = ?, attachments = ?, updated_at = ?
               WHERE id = ?`;

  await db.prepare(sql).run(
    updated.walkthrough_id, updated.scene_id, updated.yaw, updated.pitch,
    updated.floor || null, updated.room || null, updated.type, updated.severity, updated.priority || updated.severity,
    updated.status, updated.title, updated.description || '', updated.assigned_to || null, updated.due_date || null, updated.resolution_proof_url || null, updated.history, updated.comments || [], updated.attachments || [], now,
    id
  );

  return updated;
}

export async function deleteIssue(id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM issues WHERE id = ?').run(id);
  return result.changes > 0;
}

// ==================== COMMENTS ====================

export async function addComment(
  issueId: string,
  comment: { user_id: string; user_name: string; body: string; attachments?: string[] }
): Promise<IssueComment | null> {
  const existing = await db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
  if (!existing) return null;

  const newComment: IssueComment = {
    id: generateId(),
    user_id: comment.user_id,
    user_name: comment.user_name,
    body: comment.body,
    timestamp: new Date().toISOString(),
    attachments: comment.attachments || [],
  };

  const existingComments: IssueComment[] = existing.comments || [];
  existingComments.push(newComment);

  // Also add a history entry
  const history: IssueHistory[] = existing.history || [];
  history.push({
    id: generateId(),
    action: 'comment_added',
    user_id: comment.user_id,
    timestamp: newComment.timestamp,
    details: `Comment by ${comment.user_name}`,
  });

  await db.prepare(
    `UPDATE issues SET comments = ?, history = ?, updated_at = ? WHERE id = ?`
  ).run(existingComments, history, new Date().toISOString(), issueId);

  return newComment;
}

export async function getComments(issueId: string): Promise<IssueComment[]> {
  const issue = await db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
  if (!issue) return [];
  return issue.comments || [];
}

export async function deleteComment(issueId: string, commentId: string): Promise<boolean> {
  const issue = await db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
  if (!issue) return false;

  const comments: IssueComment[] = issue.comments || [];
  const filtered = comments.filter((c: IssueComment) => c.id !== commentId);
  if (filtered.length === comments.length) return false;

  await db.prepare(
    `UPDATE issues SET comments = ?, updated_at = ? WHERE id = ?`
  ).run(filtered, new Date().toISOString(), issueId);

  return true;
}

// ==================== ATTACHMENTS ====================

export async function addAttachment(
  issueId: string,
  attachment: { id?: string; file_url: string; file_type: string; created_at: string }
): Promise<IssueAttachment | null> {
  const existing = await db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
  if (!existing) return null;

  const newAttachment: IssueAttachment = {
    id: attachment.id || generateId(),
    issue_id: issueId,
    file_url: attachment.file_url,
    file_type: attachment.file_type,
    created_at: attachment.created_at,
  };

  const existingAttachments: IssueAttachment[] = existing.attachments || [];
  existingAttachments.push(newAttachment);

  await db.prepare(
    `UPDATE issues SET attachments = ?, updated_at = ? WHERE id = ?`
  ).run(existingAttachments, new Date().toISOString(), issueId);

  return newAttachment;
}

export async function getAttachments(issueId: string): Promise<IssueAttachment[]> {
  const issue = await db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
  if (!issue) return [];
  return issue.attachments || [];
}

export async function deleteAttachment(issueId: string, attachmentId: string): Promise<boolean> {
  const issue = await db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
  if (!issue) return false;

  const attachments: IssueAttachment[] = issue.attachments || [];
  const filtered = attachments.filter((a: IssueAttachment) => a.id !== attachmentId);
  if (filtered.length === attachments.length) return false;

  await db.prepare(
    `UPDATE issues SET attachments = ?, updated_at = ? WHERE id = ?`
  ).run(filtered, new Date().toISOString(), issueId);

  return true;
}

// ==================== SLA ESCALATION ====================

export interface SlaEscalationResult {
  issue_id: string;
  title: string;
  days_overdue: number;
  old_priority: string;
  new_priority: string;
  escalated: boolean;
}

/**
 * Check all open/in-progress issues for SLA breaches and auto-escalate
 * Rules:
 * - If overdue by 1+ days: upgrade priority (low->medium->high->critical)
 * - If overdue by 3+ days: change status to 'pending_approval' (escalate to manager)
 * - Add history entry for each escalation
 */
export async function checkAndEscalateSLA(): Promise<SlaEscalationResult[]> {
  const now = new Date();
  const issues = await getIssues();
  const results: SlaEscalationResult[] = [];

  for (const issue of issues) {
    if (!issue.due_date) continue;
    if (['resolved', 'verified', 'closed'].includes(issue.status)) continue;

    const due = new Date(issue.due_date);
    const diffMs = now.getTime() - due.getTime();
    const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysOverdue < 1) continue; // Not overdue yet

    const oldPriority = issue.priority;
    let newPriority = issue.priority;
    let newStatus = issue.status;
    const historyEntries: IssueHistory[] = issue.history || [];

    // Escalate priority based on days overdue
    if (daysOverdue >= 3) {
      newPriority = 'critical';
    } else if (daysOverdue >= 2) {
      if (issue.priority === 'low' || issue.priority === 'medium') newPriority = 'high';
    } else if (daysOverdue >= 1) {
      if (issue.priority === 'low') newPriority = 'medium';
    }

    // Escalate status after 3+ days overdue
    if (daysOverdue >= 3 && issue.status !== 'pending_approval') {
      newStatus = 'pending_approval';
      historyEntries.push({
        id: generateId(),
        issue_id: issue.id,
        action: 'sla_escalated',
        field: 'status',
        old_value: issue.status,
        new_value: newStatus,
        user_id: 'system',
        user_name: 'SLA Auto-Escalation',
        timestamp: new Date().toISOString(),
        details: `Auto-escalated after ${daysOverdue} days overdue`,
        created_at: new Date().toISOString(),
      });
    }

    // Add priority escalation history
    if (newPriority !== oldPriority) {
      historyEntries.push({
        id: generateId(),
        issue_id: issue.id,
        action: 'sla_priority_escalated',
        field: 'priority',
        old_value: oldPriority,
        new_value: newPriority,
        user_id: 'system',
        user_name: 'SLA Auto-Escalation',
        timestamp: new Date().toISOString(),
        details: `Priority escalated after ${daysOverdue} days overdue`,
        created_at: new Date().toISOString(),
      });
    }

    if (newPriority !== oldPriority || newStatus !== issue.status) {
      await db.prepare(
        `UPDATE issues SET priority = ?, status = ?, history = ?, updated_at = ? WHERE id = ?`
      ).run(newPriority, newStatus, historyEntries, new Date().toISOString(), issue.id);

      results.push({
        issue_id: issue.id,
        title: issue.title,
        days_overdue: daysOverdue,
        old_priority: oldPriority,
        new_priority: newPriority,
        escalated: true,
      });
    }
  }

  return results;
}

/**
 * Get SLA statistics for dashboard
 */
export async function getSlaStats(): Promise<{
  total_with_sla: number;
  overdue: number;
  critical_overdue: number;
  avg_resolution_days: number;
}> {
  const issues = await getIssues();
  const now = new Date();

  const withSla = issues.filter(i => i.due_date);
  const overdue = withSla.filter(i => {
    if (['resolved', 'verified', 'closed'].includes(i.status)) return false;
    return new Date(i.due_date!) < now;
  });
  const criticalOverdue = overdue.filter(i => i.priority === 'critical' || i.priority === 'high');

  // Calculate average resolution time for resolved issues
  const resolved = issues.filter(i => i.status === 'resolved' || i.status === 'verified');
  let totalDays = 0;
  let counted = 0;
  for (const issue of resolved) {
    const created = new Date(issue.created_at);
    const updated = new Date(issue.updated_at);
    totalDays += (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    counted++;
  }

  return {
    total_with_sla: withSla.length,
    overdue: overdue.length,
    critical_overdue: criticalOverdue.length,
    avg_resolution_days: counted > 0 ? Math.round(totalDays / counted * 10) / 10 : 0,
  };
}
