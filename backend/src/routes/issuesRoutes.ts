import express from 'express';
import { createIssue, getIssues } from '../services/issue.service';

const router = express.Router();

// Create a new issue
router.post('/', async (req, res) => {
  try {
    const issueData = req.body;
    const issue = await createIssue(issueData);
    res.status(201).json(issue);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

// Get all issues with optional filters
router.get('/', async (req, res) => {
  try {
    const { scene_id, walkthrough_id } = req.query;
    let issues = await getIssues();
    if (scene_id) {
      issues = issues.filter(issue => issue.scene_id === scene_id);
    }
    if (walkthrough_id) {
      issues = issues.filter(issue => issue.walkthrough_id === walkthrough_id);
    }
    res.json(issues);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

export default router;
