"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const auth_1 = require("../middleware/auth");
const error_1 = require("../middleware/error");
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(auth_1.authenticate);
// GET /api/users - List all users (admin or manager)
router.get('/', (0, auth_1.requireRole)('admin', 'manager'), (req, res) => {
    const users = auth_service_1.authService.getAllUsers();
    res.json({ success: true, data: users });
});
// POST /api/users - Create new user (admin only)
router.post('/', (0, auth_1.requireRole)('admin'), (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            throw new error_1.AppError('Username, email, and password are required', 400);
        }
        if (password.length < 6) {
            throw new error_1.AppError('Password must be at least 6 characters', 400);
        }
        const result = auth_service_1.authService.register({ username, email, password, role });
        res.status(201).json({ success: true, data: result.user });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError(error.message || 'Failed to create user', 400);
    }
});
// PUT /api/users/:id - Update user (admin only)
router.put('/:id', (0, auth_1.requireRole)('admin'), (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role, password } = req.body;
        const user = auth_service_1.authService.updateUser(id, { username, email, role, password });
        if (!user) {
            throw new error_1.AppError('User not found', 404);
        }
        // Return user without password hash
        const { password_hash, ...safeUser } = user;
        res.json({ success: true, data: safeUser });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError(error.message || 'Failed to update user', 400);
    }
});
// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', (0, auth_1.requireRole)('admin'), (req, res) => {
    try {
        const { id } = req.params;
        // Prevent self-deletion
        if (req.user && req.user.id === id) {
            throw new error_1.AppError('Cannot delete your own account', 400);
        }
        const deleted = auth_service_1.authService.deleteUser(id);
        if (!deleted) {
            throw new error_1.AppError('User not found', 404);
        }
        res.json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        if (error instanceof error_1.AppError)
            throw error;
        throw new error_1.AppError(error.message || 'Failed to delete user', 400);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map