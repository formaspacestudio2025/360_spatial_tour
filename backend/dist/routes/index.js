"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const issuesRoutes_1 = __importDefault(require("./issuesRoutes"));
const users_1 = __importDefault(require("./users"));
const assets_1 = __importDefault(require("./assets"));
const orgs_1 = __importDefault(require("./orgs"));
const reports_1 = __importDefault(require("./reports"));
const qrcode_1 = __importDefault(require("./qrcode"));
const inspections_1 = __importDefault(require("./inspections"));
const router = express_1.default.Router();
router.use('/issues', issuesRoutes_1.default);
router.use('/users', users_1.default);
router.use('/assets', assets_1.default);
router.use('/orgs', orgs_1.default);
router.use('/reports', reports_1.default);
router.use('/qrcode', qrcode_1.default);
router.use('/inspections', inspections_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map