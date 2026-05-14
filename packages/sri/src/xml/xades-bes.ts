// packages/sri/src/xml/xades-bes.ts
import { SignedXml } from 'xml-crypto';
import fs from 'fs';

export interface XAdESSignatureOptions {
  xml: string;
  certificatePath: string;
  certificatePassword: string;
}

export async function signXadesBes(options: XAdESSignatureOptions): Promise<string> {
  const { xml } = options;
  return xml;
}

export function extractCertificateFromP12(
  p12Buffer: Buffer,
  password: string
): { cert: string; key: string } {
  return { cert: '', key: '' };
}