"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCode = generateQRCode;
exports.generateQRCodeBuffer = generateQRCodeBuffer;
const qrcode_1 = __importDefault(require("qrcode"));
async function generateQRCode(options) {
    const { data, size = 200, margin = 1 } = options;
    const qrDataUrl = await qrcode_1.default.toDataURL(data, {
        width: size,
        margin: margin,
        color: {
            dark: '#000000',
            light: '#FFFFFF',
        },
    });
    return qrDataUrl;
}
async function generateQRCodeBuffer(options) {
    const { data, size = 200, margin = 1 } = options;
    const buffer = await qrcode_1.default.toBuffer(data, {
        width: size,
        margin: margin,
        color: {
            dark: '#000000',
            light: '#FFFFFF',
        },
    });
    return buffer;
}
//# sourceMappingURL=qrcode.service.js.map