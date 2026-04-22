import express from 'express';
import { createIssue, getIssues } from '../services/issue.service';

const router = express.Router();

// Create a new issue
router.post('/', async (req, res) => {
  try {
    const issueData = req.body;
    const issue = await createIssue(issueData);
    res.status(201).json(issue);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Get all issues
router.get('/', async (req, res) => {
  try {
    const issues = await getIssues();
    res.json(issues);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

export default router;
