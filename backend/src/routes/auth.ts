import { Router } from 'express';
import { authService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = Router();

// POST /api/auth/register - Create account
router.post('/register', (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      throw new AppError('Username, email, and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const result = authService.register({ username, email, password, role });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Registration failed', 400);
  }
});

// POST /api/auth/login - Authenticate
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError('Username and password are required', 400);
    }

    const result = authService.login({ username, password });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Login failed', 401);
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

export default router;
