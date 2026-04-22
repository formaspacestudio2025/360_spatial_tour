import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeStorage, storagePaths } from './config/storage';
import { errorHandler, notFoundHandler } from './middleware/error';
import walkthroughRoutes from './routes/walkthroughs';
import sceneRoutes from './routes/scenes';
import aiRoutes from './routes/ai';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import hotspotRoutes from './routes/hotspots';
import hotspotMediaRoutes from './routes/hotspot-media';
import hotspotLinkRoutes from './routes/hotspot-links';
import issueRoutes from './routes/issues';  // Add this line

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize storage
initializeStorage();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from storage
app.use('/storage', express.static(storagePaths.base));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Spatial Tours API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/walkthroughs', walkthroughRoutes);
app.use('/api', sceneRoutes);
app.use('/api', hotspotRoutes);
app.use('/api', hotspotMediaRoutes);
app.use('/api', hotspotLinkRoutes);
app.use('/api', aiRoutes);
app.use('/api/issues', issueRoutes);  // Add this line

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Create HTTP server (for Socket.io later)
const server = createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Storage directory: ${storagePaths.base}`);
});

export default app;
