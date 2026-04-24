import express from 'express';
import issuesRoutes from './issuesRoutes';

const router = express.Router();

router.use('/issues', issuesRoutes);

export default router;
