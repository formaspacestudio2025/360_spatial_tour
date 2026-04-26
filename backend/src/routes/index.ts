import express from 'express';
import issuesRoutes from './issuesRoutes';
import usersRoutes from './users';

const router = express.Router();

router.use('/issues', issuesRoutes);
router.use('/users', usersRoutes);

export default router;
