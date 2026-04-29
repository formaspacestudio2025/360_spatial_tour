"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const storage_1 = require("./config/storage");
const error_1 = require("./middleware/error");
const walkthroughs_1 = __importDefault(require("./routes/walkthroughs"));
const scenes_1 = __importDefault(require("./routes/scenes"));
const ai_1 = __importDefault(require("./routes/ai"));
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const hotspots_1 = __importDefault(require("./routes/hotspots"));
const hotspot_media_1 = __importDefault(require("./routes/hotspot-media"));
const hotspot_links_1 = __importDefault(require("./routes/hotspot-links"));
const users_1 = __importDefault(require("./routes/users"));
const assets_1 = __importDefault(require("./routes/assets"));
const issuesRoutes_1 = __importDefault(require("./routes/issuesRoutes"));
const routes_1 = __importDefault(require("./routes"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Initialize storage
(0, storage_1.initializeStorage)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from storage
app.use('/storage', express_1.default.static(storage_1.storagePaths.base));
// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Spatial Tours API is running',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/walkthroughs', walkthroughs_1.default);
app.use('/api', scenes_1.default);
app.use('/api', hotspots_1.default);
app.use('/api', hotspot_media_1.default);
app.use('/api', hotspot_links_1.default);
app.use('/api', ai_1.default);
app.use('/api/users', users_1.default);
app.use('/api/assets', assets_1.default);
app.use('/api/issues', issuesRoutes_1.default);
app.use('/api', routes_1.default);
// Error handling
app.use(error_1.notFoundHandler);
app.use(error_1.errorHandler);
// Create HTTP server (for Socket.io later)
const server = (0, http_1.createServer)(app);
// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📁 Storage directory: ${storage_1.storagePaths.base}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map