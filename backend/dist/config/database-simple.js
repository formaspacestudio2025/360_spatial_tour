"use strict";
// Simple database module - will be replaced with full SQL.js implementation
// For now, using a mock to get the app running
Object.defineProperty(exports, "__esModule", { value: true });
const mockDb = {
    prepare: (sql) => ({
        get: (...params) => ({}),
        all: (...params) => [],
        run: (...params) => ({ changes: 1 })
    }),
    run: (sql, params) => { },
    exec: (sql) => { }
};
exports.default = mockDb;
//# sourceMappingURL=database-simple.js.map