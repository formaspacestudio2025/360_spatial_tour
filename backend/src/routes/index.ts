import express from 'express';
import issuesRoutes from './issuesRoutes';
import usersRoutes from './users';
import assetsRoutes from './assets';
import orgsRoutes from './orgs';
import reportsRoutes from './reports';
import qrcodeRoutes from './qrcode';
import inspectionsRoutes from './inspections';

const router = express.Router();

router.use('/issues', issuesRoutes);
router.use('/users', usersRoutes);
router.use('/assets', assetsRoutes);
router.use('/orgs', orgsRoutes);
router.use('/reports', reportsRoutes);
router.use('/qrcode', qrcodeRoutes);
router.use('/inspections', inspectionsRoutes);

export default router;
