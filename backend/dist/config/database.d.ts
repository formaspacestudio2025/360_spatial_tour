interface Database {
    users: any[];
    walkthroughs: any[];
    scenes: any[];
    navigation_edges: any[];
    ai_tags: any[];
    issues: any[];
    assets: any[];
    versions: any[];
    walkthrough_members: any[];
    comments: any[];
    hotspot_media: any[];
    hotspot_links: any[];
    maintenance_schedules: any[];
    checklist_templates: any[];
    inspections: any[];
    organizations: any[];
}
declare let db: Database;
declare function save(): void;
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
    readonly tables: Database;
    prepare(sql: string): Statement;
    run(sql: string, params?: any[]): void;
    exec(sql: string): void;
    pragma(query: string): null;
    transaction(fn: Function): (...args: any[]) => any;
};
export default database;
export { db, save };
//# sourceMappingURL=database.d.ts.map