import express from 'express';
import authRoutes from './auth';
import dashboardRoutes from './dashboard';
import walkthroughRoutes from './walkthroughs';
import sceneRoutes from './scenes';
import hotspotRoutes from './hotspots';
import hotspotMediaRoutes from './hotspot-media';
import hotspotLinkRoutes from './hotspot-links';
import aiRoutes from './ai';
import issuesRoutes from './issuesRoutes';
import usersRoutes from './users';
import assetsRoutes from './assets';
import orgsRoutes from './orgs';
import reportsRoutes from './reports';
import qrcodeRoutes from './qrcode';
import inspectionsRoutes from './inspections';
import maintenanceRoutes from './maintenance';
import checklistsRoutes from './checklists';
import assetEventsRoutes from './assetEvents';
import adminRoutes from './admin';

const router = express.Router();

// Auth & Dashboard
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);

// Walkthroughs & Scenes
router.use('/walkthroughs', walkthroughRoutes);
router.use('/', sceneRoutes); // Handles /walkthroughs/:id/scenes and /scenes/:id

// Hotspots & Media
router.use('/', hotspotRoutes); // Handles /scenes/:id/hotspots and /hotspots/:id
router.use('/', hotspotMediaRoutes); // Handles /hotspot-media/:id
router.use('/', hotspotLinkRoutes); // Handles /hotspot-links/:id

// AI & Services
router.use('/', aiRoutes); // Handles /ai/config, /ai/test, and /walkthroughs/:id/ai/...
router.use('/issues', issuesRoutes);
router.use('/users', usersRoutes);
router.use('/assets', assetsRoutes);
router.use('/orgs', orgsRoutes);
router.use('/reports', reportsRoutes);
router.use('/qrcode', qrcodeRoutes);
router.use('/inspections', inspectionsRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/checklists', checklistsRoutes);
router.use('/asset-events', assetEventsRoutes);
router.use('/admin', adminRoutes);

export default router;
