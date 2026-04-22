// Simple database module - will be replaced with full SQL.js implementation
// For now, using a mock to get the app running

const mockDb = {
  prepare: (sql: string) => ({
    get: (...params: any[]) => ({}),
    all: (...params: any[]) => [],
    run: (...params: any[]) => ({ changes: 1 })
  }),
  run: (sql: string, params: any[]) => {},
  exec: (sql: string) => {}
};

export default mockDb;
