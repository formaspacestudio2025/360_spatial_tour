"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const issue_service_1 = require("../services/issue.service");
const router = express_1.default.Router();
// Create a new issue
router.post('/', async (req, res) => {
    try {
        const issueData = req.body;
        const issue = await (0, issue_service_1.createIssue)(issueData);
        res.status(201).json(issue);
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ message: err.message });
    }
});
// Get all issues
router.get('/', async (req, res) => {
    try {
        const issues = await (0, issue_service_1.getIssues)();
        res.json(issues);
    }
    catch (error) {
        const err = error;
        res.status(err.statusCode || 500).json({ message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=issuesRoutes.js.map