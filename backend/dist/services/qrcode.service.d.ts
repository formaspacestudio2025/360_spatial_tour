export interface QRCodeOptions {
    data: string;
    size?: number;
    margin?: number;
}
export declare function generateQRCode(options: QRCodeOptions): Promise<string>;
export declare function generateQRCodeBuffer(options: QRCodeOptions): Promise<Buffer>;
//# sourceMappingURL=qrcode.service.d.ts.map