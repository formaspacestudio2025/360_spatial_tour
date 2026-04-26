import { Router } from 'express';
import { authService } from '../services/auth.service';
import { authenticate, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { UserRole } from '../types/user';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users - List all users (admin or manager)
router.get('/', requireRole('admin', 'manager'), (req, res) => {
  const users = authService.getAllUsers();
  res.json({ success: true, data: users });
});

// POST /api/users - Create new user (admin only)
router.post('/', requireRole('admin'), (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      throw new AppError('Username, email, and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const result = authService.register({ username, email, password, role });
    res.status(201).json({ success: true, data: result.user });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to create user', 400);
  }
});

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;

    const user = authService.updateUser(id, { username, email, role, password });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Return user without password hash
    const { password_hash, ...safeUser } = user as any;
    res.json({ success: true, data: safeUser });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to update user', 400);
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user && req.user.id === id) {
      throw new AppError('Cannot delete your own account', 400);
    }

    const deleted = authService.deleteUser(id);
    if (!deleted) {
      throw new AppError('User not found', 404);
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to delete user', 400);
  }
});

export default router;
