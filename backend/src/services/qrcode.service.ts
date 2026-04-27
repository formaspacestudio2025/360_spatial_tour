import qrcode from 'qrcode';

export interface QRCodeOptions {
  data: string;
  size?: number;
  margin?: number;
}

export async function generateQRCode(options: QRCodeOptions): Promise<string> {
  const { data, size = 200, margin = 1 } = options;

  const qrDataUrl = await qrcode.toDataURL(data, {
    width: size,
    margin: margin,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return qrDataUrl;
}

export async function generateQRCodeBuffer(options: QRCodeOptions): Promise<Buffer> {
  const { data, size = 200, margin = 1 } = options;

  const buffer = await qrcode.toBuffer(data, {
    width: size,
    margin: margin,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return buffer;
}
