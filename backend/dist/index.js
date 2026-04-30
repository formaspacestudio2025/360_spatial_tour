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