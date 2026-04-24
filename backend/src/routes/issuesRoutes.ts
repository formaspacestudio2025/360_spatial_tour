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

// Get all issues
router.get('/', async (req, res) => {
  try {
    const issues = await getIssues();
    res.json(issues);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

export default router;
