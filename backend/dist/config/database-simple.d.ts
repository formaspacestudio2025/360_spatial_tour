declare const mockDb: {
    prepare: (sql: string) => {
        get: (...params: any[]) => {};
        all: (...params: any[]) => never[];
        run: (...params: any[]) => {
            changes: number;
        };
    };
    run: (sql: string, params: any[]) => void;
    exec: (sql: string) => void;
};
export default mockDb;
//# sourceMappingURL=database-simple.d.ts.map