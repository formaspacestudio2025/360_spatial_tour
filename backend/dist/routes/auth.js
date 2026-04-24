"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const auth_1 = require("../middleware/auth");
const error_1 = require("../middleware/error");
const router = (0, express_1.Router)();
// POST /api/auth/register - Create account
router.post('/register', (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            throw new error_1.AppError('Username, email, and password are required', 400);
        }
        if (password.length < 6) {
            throw new error_1.AppError('Password must be at least 6 characters', 400);
        }
        const result = auth_service_1.authService.register({ username, email, password, role });
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError(error.message || 'Registration failed', 400);
    }
});
// POST /api/auth/login - Authenticate
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new error_1.AppError('Username and password are required', 400);
        }
        const result = auth_service_1.authService.login({ username, password });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError(error.message || 'Login failed', 401);
    }
});
// GET /api/auth/me - Get current user
router.get('/me', auth_1.authenticate, (req, res) => {
    res.json({
        success: true,
        data: req.user,
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map