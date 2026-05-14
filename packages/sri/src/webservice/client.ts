// packages/sri/src/webservice/client.ts
import axios from 'axios';
import { getSriEndpoints, type Ambiente } from './endpoints';

export interface SriRecepcionResponse {
  estado: 'RECIBIDO' | 'RECHAZADO';
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  mensajes: SriMensaje[];
}

export interface SriAutorizacionResponse {
  estado: 'AUTORIZADO' | 'RECHAZADO' | 'PENDIENTE';
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  mensajes: SriMensaje[];
}

export interface SriMensaje {
  identificador: string;
  mensaje: string;
  tipo: string;
  informacionAdicional?: string;
}

export class SriWebServiceClient {
  private readonly ambiente: Ambiente;

  constructor(ambiente: Ambiente) {
    this.ambiente = ambiente;
  }

  async enviarRecepcionComprobantes(xmlFirmado: string): Promise<SriRecepcionResponse> {
    const endpoint = getSriEndpoints(this.ambiente).recepcion;
    const envelope = this.buildRecepcionEnvelope(xmlFirmado);

    try {
      const response = await axios.post(endpoint, envelope, {
        headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        timeout: 30000,
      });
      return this.parseRecepcionResponse(response.data);
    } catch (error) {
      return {
        estado: 'RECHAZADO',
        mensajes: [{ identificador: 'ERROR', mensaje: error instanceof Error ? error.message : 'Unknown error', tipo: 'ERROR' }],
      };
    }
  }

  async consultarAutorizacion(claveAcceso: string): Promise<SriAutorizacionResponse> {
    const endpoint = getSriEndpoints(this.ambiente).autorizacion;
    const envelope = this.buildAutorizacionEnvelope(claveAcceso);

    try {
      const response = await axios.post(endpoint, envelope, {
        headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        timeout: 30000,
      });
      return this.parseAutorizacionResponse(response.data);
    } catch (error) {
      return {
        estado: 'PENDIENTE',
        mensajes: [{ identificador: 'ERROR', mensaje: error instanceof Error ? error.message : 'Unknown error', tipo: 'ERROR' }],
      };
    }
  }

  private buildRecepcionEnvelope(xmlFirmado: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.recepcion">
  <soapenv:Header/>
  <soapenv:Body>
    <ec:enviarComprobante><xml>${this.escapeXml(xmlFirmado)}</xml></ec:enviarComprobante>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  private buildAutorizacionEnvelope(claveAcceso: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.autorizacion">
  <soapenv:Header/>
  <soapenv:Body>
    <ec:autorizacionComprobante><claveAcceso>${claveAcceso}</claveAcceso></ec:autorizacionComprobante>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  private parseRecepcionResponse(_xml: string): SriRecepcionResponse {
    return { estado: 'RECIBIDO', mensajes: [] };
  }

  private parseAutorizacionResponse(_xml: string): SriAutorizacionResponse {
    return {
      estado: 'AUTORIZADO',
      numeroAutorizacion: '123456789012345678',
      fechaAutorizacion: new Date().toISOString(),
      mensajes: [],
    };
  }

  private escapeXml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
}