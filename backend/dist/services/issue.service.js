"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIssue = createIssue;
exports.getIssues = getIssues;
exports.updateIssue = updateIssue;
exports.resolveIssue = resolveIssue;
exports.deleteIssue = deleteIssue;
exports.addComment = addComment;
exports.getComments = getComments;
exports.deleteComment = deleteComment;
exports.addAttachment = addAttachment;
exports.getAttachments = getAttachments;
exports.deleteAttachment = deleteAttachment;
exports.checkAndEscalateSLA = checkAndEscalateSLA;
exports.getSlaStats = getSlaStats;
const database_1 = __importDefault(require("../config/database"));
const generateId_1 = require("../utils/generateId");
async function createIssue(data) {
    const id = (0, generateId_1.generateId)();
    const now = new Date().toISOString();
    const initialHistory = [{
            id: (0, generateId_1.generateId)(),
            action: 'created',
            timestamp: now,
            details: 'Issue created'
        }];
    const priority = data.priority || data.severity;
    const sql = `INSERT INTO issues (id, walkthrough_id, scene_id, yaw, pitch, floor, room, type, severity, priority, status, title, description, assigned_to, due_date, org_id, property_id, history, comments, attachments, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await database_1.default.prepare(sql).run(id, data.walkthrough_id, data.scene_id, data.yaw, data.pitch, data.floor || null, data.room || null, data.type, data.severity, priority, 'open', data.title, data.description || '', data.assigned_to || null, data.due_date || null, data.org_id || null, data.property_id || null, initialHistory, [], data.attachments || [], now, now);
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
async function getIssues() {
    const sql = 'SELECT * FROM issues ORDER BY created_at DESC';
    const stmt = database_1.default.prepare(sql);
    const issues = await stmt.all();
    return issues;
}
async function updateIssue(id, data) {
    const now = new Date().toISOString();
    const existing = await database_1.default.prepare('SELECT * FROM issues WHERE id = ?').get(id);
    if (!existing)
        return null;
    // Record history if status or assignment changes
    const newHistoryEntry = (() => {
        const details = [];
        if (data.status && data.status !== existing.status)
            details.push(`Status changed to ${data.status}`);
        if (data.assigned_to !== undefined && data.assigned_to !== existing.assigned_to) {
            details.push(data.assigned_to ? `Assigned to ${data.assigned_to}` : 'Unassigned');
        }
        if (data.priority && data.priority !== existing.priority)
            details.push(`Priority changed to ${data.priority}`);
        if (details.length > 0) {
            return {
                id: (0, generateId_1.generateId)(),
                action: 'updated',
                timestamp: now,
                details: details.join(', ')
            };
        }
        return null;
    })();
    const history = existing.history || [];
    if (newHistoryEntry)
        history.push(newHistoryEntry);
    const updated = { ...existing, ...data, history, updated_at: now };
    const sql = `UPDATE issues SET
                walkthrough_id = ?, scene_id = ?, yaw = ?, pitch = ?,
                floor = ?, room = ?, type = ?, severity = ?, priority = ?,
                org_id = ?, property_id = ?,
                status = ?, title = ?, description = ?, assigned_to = ?, due_date = ?, resolution_proof_url = ?, resolution_image_url = ?, resolved_at = ?, history = ?, comments = ?, attachments = ?, updated_at = ?
               WHERE id = ?`;
    await database_1.default.prepare(sql).run(updated.walkthrough_id, updated.scene_id, updated.yaw, updated.pitch, updated.floor || null, updated.room || null, updated.type, updated.severity, updated.priority || updated.severity, updated.org_id || null, updated.property_id || null, updated.status, updated.title, updated.description || '', updated.assigned_to || null, updated.due_date || null, updated.resolution_proof_url || null, updated.resolution_image_url || null, updated.resolved_at || null, updated.history, updated.comments || [], updated.attachments || [], now, id);
    return updated;
}
// ==================== RESOLUTION PROOF ====================
/**
 * Upload resolution proof image and mark issue as resolved.
 */
async function resolveIssue(id, resolutionImageUrl) {
    const now = new Date().toISOString();
    const existing = await database_1.default.prepare('SELECT * FROM issues WHERE id = ?').get(id);
    if (!existing)
        return null;
    const updated = {
        ...existing,
        resolution_image_url: resolutionImageUrl,
        resolved_at: now,
        status: 'resolved',
        updated_at: now,
    };
    await database_1.default.prepare(`UPDATE issues SET resolution_image_url = ?, resolved_at = ?, status = ?, updated_at = ? WHERE id = ?`).run(resolutionImageUrl, now, 'resolved', now, id);
    return updated;
}
async function deleteIssue(id) {
    const result = await database_1.default.prepare('DELETE FROM issues WHERE id = ?').run(id);
    return result.changes > 0;
}
// ==================== COMMENTS ====================
async function addComment(issueId, comment) {
    const existing = await database_1.default.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
    if (!existing)
        return null;
    const newComment = {
        id: (0, generateId_1.generateId)(),
        user_id: comment.user_id,
        user_name: comment.user_name,
        body: comment.body,
        timestamp: new Date().toISOString(),
        attachments: comment.attachments || [],
    };
    const existingComments = existing.comments || [];
    existingComments.push(newComment);
    // Also add a history entry
    const history = existing.history || [];
    history.push({
        id: (0, generateId_1.generateId)(),
        action: 'comment_added',
        user_id: comment.user_id,
        timestamp: newComment.timestamp,
        details: `Comment by ${comment.user_name}`,
    });
    await database_1.default.prepare(`UPDATE issues SET comments = ?, history = ?, updated_at = ? WHERE id = ?`).run(existingComments, history, new Date().toISOString(), issueId);
    return newComment;
}
async function getComments(issueId) {
    const issue = await database_1.default.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
    if (!issue)
        return [];
    return issue.comments || [];
}
async function deleteComment(issueId, commentId) {
    const issue = await database_1.default.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
    if (!issue)
        return false;
    const comments = issue.comments || [];
    const filtered = comments.filter((c) => c.id !== commentId);
    if (filtered.length === comments.length)
        return false;
    await database_1.default.prepare(`UPDATE issues SET comments = ?, updated_at = ? WHERE id = ?`).run(filtered, new Date().toISOString(), issueId);
    return true;
}
// ==================== ATTACHMENTS ====================
async function addAttachment(issueId, attachment) {
    const existing = await database_1.default.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
    if (!existing)
        return null;
    const newAttachment = {
        id: attachment.id || (0, generateId_1.generateId)(),
        issue_id: issueId,
        file_url: attachment.file_url,
        file_type: attachment.file_type,
        created_at: attachment.created_at,
    };
    const existingAttachments = existing.attachments || [];
    existingAttachments.push(newAttachment);
    await database_1.default.prepare(`UPDATE issues SET attachments = ?, updated_at = ? WHERE id = ?`).run(existingAttachments, new Date().toISOString(), issueId);
    return newAttachment;
}
async function getAttachments(issueId) {
    const issue = await database_1.default.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
    if (!issue)
        return [];
    return issue.attachments || [];
}
async function deleteAttachment(issueId, attachmentId) {
    const issue = await database_1.default.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
    if (!issue)
        return false;
    const attachments = issue.attachments || [];
    const filtered = attachments.filter((a) => a.id !== attachmentId);
    if (filtered.length === attachments.length)
        return false;
    await database_1.default.prepare(`UPDATE issues SET attachments = ?, updated_at = ? WHERE id = ?`).run(filtered, new Date().toISOString(), issueId);
    return true;
}
/**
 * Check all open/in-progress issues for SLA breaches and auto-escalate
 * Rules:
 * - If overdue by 1+ days: upgrade priority (low->medium->high->critical)
 * - If overdue by 3+ days: change status to 'pending_approval' (escalate to manager)
 * - Add history entry for each escalation
 */
async function checkAndEscalateSLA() {
    const now = new Date();
    const issues = await getIssues();
    const results = [];
    for (const issue of issues) {
        if (!issue.due_date)
            continue;
        if (['resolved', 'verified', 'closed'].includes(issue.status))
            continue;
        const due = new Date(issue.due_date);
        const diffMs = now.getTime() - due.getTime();
        const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (daysOverdue < 1)
            continue; // Not overdue yet
        const oldPriority = issue.priority;
        let newPriority = issue.priority;
        let newStatus = issue.status;
        const historyEntries = issue.history || [];
        // Escalate priority based on days overdue
        if (daysOverdue >= 3) {
            newPriority = 'critical';
        }
        else if (daysOverdue >= 2) {
            if (issue.priority === 'low' || issue.priority === 'medium')
                newPriority = 'high';
        }
        else if (daysOverdue >= 1) {
            if (issue.priority === 'low')
                newPriority = 'medium';
        }
        // Escalate status after 3+ days overdue
        if (daysOverdue >= 3 && issue.status !== 'pending_approval') {
            newStatus = 'pending_approval';
            historyEntries.push({
                id: (0, generateId_1.generateId)(),
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
                id: (0, generateId_1.generateId)(),
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
            await database_1.default.prepare(`UPDATE issues SET priority = ?, status = ?, history = ?, updated_at = ? WHERE id = ?`).run(newPriority, newStatus, historyEntries, new Date().toISOString(), issue.id);
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
async function getSlaStats() {
    const issues = await getIssues();
    const now = new Date();
    const withSla = issues.filter(i => i.due_date);
    const overdue = withSla.filter(i => {
        if (['resolved', 'verified', 'closed'].includes(i.status))
            return false;
        return new Date(i.due_date) < now;
    });
    const criticalOverdue = overdue.filter(i => i.priority === 'critical' || i.priority === 'high');
    // Calculate average resolution time for resolved issues
    const resolved = issues.filter(i => i.status === 'resolved' || i.status === 'verified');
    let totalDays = 0;
    let counted = 0;
    for (const issue of resolved) {
        const created = new Date(issue.created_at);
        const updated = new Date(issue.updated_at);
        totalDays += (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        counted++;
    }
    return {
        total_with_sla: withSla.length,
        overdue: overdue.length,
        critical_overdue: criticalOverdue.length,
        avg_resolution_days: counted > 0 ? Math.round(totalDays / counted * 10) / 10 : 0,
    };
}
//# sourceMappingURL=issue.service.js.map