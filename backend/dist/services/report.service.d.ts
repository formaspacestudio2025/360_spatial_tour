export interface ReportOptions {
    title?: string;
    subtitle?: string;
    content: string;
    footer?: string;
}
export declare function generatePdf(htmlContent: string): Promise<Buffer>;
export declare function generateIssueReport(issueId: string): Promise<Buffer>;
export declare function generateInspectionReport(inspectionId: string): Promise<Buffer>;
//# sourceMappingURL=report.service.d.ts.map