// packages/sri/src/certificate/CertificateLoader.ts
import forge from 'node-forge';
import fs from 'fs';

export interface CertificateData {
  cert: string;
  key: string;
  password: string;
}

export interface ICertificateLoader {
  load(path: string, password: string): Promise<CertificateData>;
}

export class CertificateLoader implements ICertificateLoader {
  async load(path: string, password: string): Promise<CertificateData> {
    if (!fs.existsSync(path)) {
      throw new Error(`Certificate file not found: ${path}`);
    }

    const p12Buffer = fs.readFileSync(path);
    const p12Der = forge.util.createBuffer(p12Buffer.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    let cert = '';
    let key = '';

    const keyBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

    const certBagKey = forge.pki.oids.certBag as keyof typeof keyBags;
    const certBagItems: Array<{ cert?: forge.pki.Certificate }> = keyBags[certBagKey] ?? [];
    const firstCertBag = certBagItems[0];
    if (firstCertBag?.cert) {
      cert = forge.pki.certificateToPem(firstCertBag.cert);
    }

    const keyBagKey = forge.pki.oids.pkcs8ShroudedKeyBag as keyof typeof certBags;
    const keyBagItems: Array<{ key?: forge.pki.rsa.PrivateKey }> = certBags[keyBagKey] ?? [];
    const firstKeyBag = keyBagItems[0];
    if (firstKeyBag?.key) {
      key = forge.pki.privateKeyToPem(firstKeyBag.key);
    }

    if (!cert || !key) {
      throw new Error('Failed to extract certificate or private key from PKCS#12');
    }

    return { cert, key, password };
  }
}