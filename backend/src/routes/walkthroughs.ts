import { Router } from 'express';
import { walkthroughService, CreateWalkthroughData } from '../services/walkthrough.service';
import { AppError } from '../middleware/error';
import { authenticate, requireRole } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

// GET /api/walkthroughs - Get all walkthroughs (public)
router.get('/', authenticate, requirePermission('walkthrough','read'), (req, res) => {
  try {
    const query = {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      client: req.query.client as string | undefined,
    };
    const walkthroughs = walkthroughService.getAll(query);
    res.json({
      success: true,
      data: walkthroughs,
    });
  } catch (error) {
    throw new AppError('Failed to fetch walkthroughs', 500);
  }
});

// GET /api/walkthroughs/clients - Get unique clients (must be before /:id)
router.get('/clients', (req, res) => {
  try {
    const clients = walkthroughService.getClients();
    res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    throw new AppError('Failed to fetch clients', 500);
  }
});

// GET /api/walkthroughs/:id - Get walkthrough by ID
router.get('/:id', (req, res) => {
  try {
    const walkthrough = walkthroughService.getWithStats(req.params.id);
    
    if (!walkthrough) {
      throw new AppError('Walkthrough not found', 404);
    }

    res.json({
      success: true,
      data: walkthrough,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch walkthrough', 500);
  }
});

// POST /api/walkthroughs - Create walkthrough (editor+)
router.post('/', authenticate, requireRole('editor', 'manager', 'admin'), (req, res) => {
  try {
    const data: CreateWalkthroughData = req.body;

    if (!data.name) {
      throw new AppError('Walkthrough name is required', 400);
    }

    const walkthrough = walkthroughService.create(data);

    res.status(201).json({
      success: true,
      data: walkthrough,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create walkthrough', 500);
  }
});

// PUT /api/walkthroughs/:id - Update walkthrough (editor+)
router.put('/:id', authenticate, requireRole('editor', 'manager', 'admin'), (req, res) => {
  try {
    const data = req.body;
    const walkthrough = walkthroughService.update(req.params.id, data);

    if (!walkthrough) {
      throw new AppError('Walkthrough not found', 404);
    }

    res.json({
      success: true,
      data: walkthrough,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update walkthrough', 500);
  }
});

// DELETE /api/walkthroughs/:id - Delete walkthrough (manager+)
router.delete('/:id', authenticate, requireRole('manager', 'admin'), (req, res) => {
  try {
    const deleted = walkthroughService.delete(req.params.id);

    if (!deleted) {
      throw new AppError('Walkthrough not found', 404);
    }

    res.json({
      success: true,
      message: 'Walkthrough deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete walkthrough', 500);
  }
});

export default router;
