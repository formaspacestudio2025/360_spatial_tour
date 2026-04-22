import express from 'express';
import { IssueService } from '../services/issue.service';

const router = express.Router();
const issueService = new IssueService();

router.post('/', async (req, res) => {
  try {
    const data: CreateIssueData = req.body;
    const issue = await issueService.create(data);
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data: Partial<Issue> = req.body;
    const issue = await issueService.update(id, data);
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await issueService.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete issue' });
  }
});

router.get('/', async (req, res) => {
  try {
    const issues = await issueService.list();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list issues' });
  }
});

export default router;
