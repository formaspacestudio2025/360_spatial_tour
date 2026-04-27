import express from 'express';
import issuesRoutes from './issuesRoutes';
import usersRoutes from './users';
import assetsRoutes from './assets';
import orgsRoutes from './orgs';

const router = express.Router();

router.use('/issues', issuesRoutes);
router.use('/users', usersRoutes);
router.use('/assets', assetsRoutes);
router.use('/orgs', orgsRoutes);

export default router;
