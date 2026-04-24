declare class Statement {
    private table;
    private sql;
    private isSelect;
    private isInsert;
    private isUpdate;
    private isDelete;
    constructor(table: string, sql: string);
    get(...params: any[]): any;
    all(...params: any[]): any[];
    run(...params: any[]): any;
}
declare const database: {
    prepare(sql: string): Statement;
    run(sql: string, params?: any[]): void;
    exec(sql: string): void;
    pragma(query: string): null;
    transaction(fn: Function): (...args: any[]) => any;
};
export default database;
//# sourceMappingURL=database.d.ts.map