"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const issue_service_1 = require("../issue.service");
const database_1 = __importDefault(require("../../config/database"));
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        prepare: jest.fn(),
    },
    generateId: () => 'test-id-123',
}));
describe('resolveIssue', () => {
    it('should update issue with resolution image url and resolved_at timestamp', async () => {
        const mockGet = jest.fn().mockReturnValue({
            id: 'issue-1',
            status: 'open',
            resolution_image_url: null,
            resolved_at: null,
        });
        const mockRun = jest.fn();
        database_1.default.prepare.mockImplementation((sql) => {
            if (sql.startsWith('SELECT'))
                return { get: mockGet };
            if (sql.startsWith('UPDATE'))
                return { run: mockRun };
            return { get: jest.fn(), run: jest.fn() };
        });
        const result = await (0, issue_service_1.resolveIssue)('issue-1', 'http://example.com/proof.jpg');
        expect(result).toBeDefined();
        expect(result?.resolution_image_url).toBe('http://example.com/proof.jpg');
        expect(result?.resolved_at).toBeDefined();
        expect(result?.status).toBe('resolved');
        expect(mockRun).toHaveBeenCalled();
    });
    it('should return null if issue not found', async () => {
        const mockGet = jest.fn().mockReturnValue(null);
        database_1.default.prepare.mockImplementation((sql) => {
            if (sql.startsWith('SELECT'))
                return { get: mockGet };
            return { get: jest.fn(), run: jest.fn() };
        });
        const result = await (0, issue_service_1.resolveIssue)('non-existent', 'http://example.com/img.jpg');
        expect(result).toBeNull();
    });
});
//# sourceMappingURL=issue.service.test.js.map