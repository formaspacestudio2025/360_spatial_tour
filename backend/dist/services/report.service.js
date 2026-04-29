"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdf = generatePdf;
exports.generateIssueReport = generateIssueReport;
exports.generateInspectionReport = generateInspectionReport;
const puppeteer_1 = __importDefault(require("puppeteer"));
const database_1 = __importDefault(require("../config/database"));
async function generatePdf(htmlContent) {
    const browser = await puppeteer_1.default.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
}
async function generateIssueReport(issueId) {
    const issue = await database_1.default.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
    if (!issue)
        throw new Error('Issue not found');
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #1a1a1a; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
        .meta { color: #666; font-size: 12px; margin: 5px 0; }
        .section { margin: 20px 0; }
        .label { font-weight: bold; color: #4f46e5; }
      </style>
    </head>
    <body>
      <h1>Issue Report</h1>
      <div class="meta">ID: ${issue.id}</div>
      <div class="meta">Created: ${new Date(issue.created_at).toLocaleDateString()}</div>
      <div class="section">
        <div class="label">Title</div>
        <div>${issue.title}</div>
      </div>
      <div class="section">
        <div class="label">Description</div>
        <div>${issue.description || 'No description'}</div>
      </div>
      <div class="section">
        <div class="label">Status</div>
        <div>${issue.status}</div>
      </div>
      <div class="section">
        <div class="label">Priority</div>
        <div>${issue.priority}</div>
      </div>
    </body>
    </html>
  `;
    return generatePdf(html);
}
async function generateInspectionReport(inspectionId) {
    // Placeholder - will implement when inspection model is fully integrated
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #1a1a1a; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>Inspection Report</h1>
      <p>Inspection ID: ${inspectionId}</p>
    </body>
    </html>
  `;
    return generatePdf(html);
}
//# sourceMappingURL=report.service.js.map