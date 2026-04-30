"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const dashboard_1 = __importDefault(require("./dashboard"));
const walkthroughs_1 = __importDefault(require("./walkthroughs"));
const scenes_1 = __importDefault(require("./scenes"));
const hotspots_1 = __importDefault(require("./hotspots"));
const hotspot_media_1 = __importDefault(require("./hotspot-media"));
const hotspot_links_1 = __importDefault(require("./hotspot-links"));
const ai_1 = __importDefault(require("./ai"));
const issuesRoutes_1 = __importDefault(require("./issuesRoutes"));
const users_1 = __importDefault(require("./users"));
const assets_1 = __importDefault(require("./assets"));
const orgs_1 = __importDefault(require("./orgs"));
const reports_1 = __importDefault(require("./reports"));
const qrcode_1 = __importDefault(require("./qrcode"));
const inspections_1 = __importDefault(require("./inspections"));
const maintenance_1 = __importDefault(require("./maintenance"));
const checklists_1 = __importDefault(require("./checklists"));
const router = express_1.default.Router();
// Auth & Dashboard
router.use('/auth', auth_1.default);
router.use('/dashboard', dashboard_1.default);
// Walkthroughs & Scenes
router.use('/walkthroughs', walkthroughs_1.default);
router.use('/', scenes_1.default); // Handles /walkthroughs/:id/scenes and /scenes/:id
// Hotspots & Media
router.use('/', hotspots_1.default); // Handles /scenes/:id/hotspots and /hotspots/:id
router.use('/', hotspot_media_1.default); // Handles /hotspot-media/:id
router.use('/', hotspot_links_1.default); // Handles /hotspot-links/:id
// AI & Services
router.use('/', ai_1.default); // Handles /ai/config, /ai/test, and /walkthroughs/:id/ai/...
router.use('/issues', issuesRoutes_1.default);
router.use('/users', users_1.default);
router.use('/assets', assets_1.default);
router.use('/orgs', orgs_1.default);
router.use('/reports', reports_1.default);
router.use('/qrcode', qrcode_1.default);
router.use('/inspections', inspections_1.default);
router.use('/maintenance', maintenance_1.default);
router.use('/checklists', checklists_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map