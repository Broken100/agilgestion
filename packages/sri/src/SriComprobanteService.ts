// packages/sri/src/SriComprobanteService.ts
import type { Venta, Cliente } from '@agilgestion/domain';
import { SriWebServiceClient, type SriRecepcionResponse, type SriAutorizacionResponse } from './webservice/client';
import { FacturaXmlBuilder, type FacturaXmlInput } from './xml/FacturaXmlBuilder';
import { CalculoSriService } from '@agilgestion/domain';
import type { Ambiente } from './webservice/endpoints';

export interface SriXmlResult {
  xmlFirmado: string;
  claveAcceso: string;
}

export interface SriResponse {
  estado: 'AUTORIZADO' | 'RECHAZADO' | 'RECIBIDO' | 'PENDIENTE';
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  mensajes: Array<{
    identificador: string;
    mensaje: string;
    tipo: string;
  }>;
}

export class SriComprobanteService {
  constructor(
    private webService: SriWebServiceClient,
    private certificatePath: string,
    private certificatePassword: string
  ) {}

  async generarXml(
    venta: Venta,
    cliente: Cliente | null,
    business: { ruc: string; nombre: string; nombreComercial?: string | null; direccion?: string | null; ambienteSri?: string | null }
  ): Promise<SriXmlResult> {
    const calculoSri = new CalculoSriService();
    const secuencia = this.extraerSecuencial(venta.numeroFactura);
    const ambiente = (business.ambienteSri ?? 'PRUEBAS') as Ambiente;

    const claveAcceso = calculoSri.generarClaveAcceso(
      venta.fecha,
      'FACTURA',
      business.ruc,
      secuencia,
      ambiente
    );

    const xmlBuilder = new FacturaXmlBuilder();
    const xmlSinFirma = xmlBuilder.build({
      venta,
      cliente,
      business,
      claveAcceso,
    });

    const xmlFirmado = await this.firmarXml(xmlSinFirma);

    return { xmlFirmado, claveAcceso };
  }

  async enviarXml(xml: string, claveAcceso: string): Promise<SriResponse> {
    const response = await this.webService.enviarRecepcionComprobantes(xml);
    return this.mapRecepcionResponse(response);
  }

  async pollAutorizacion(claveAcceso: string): Promise<SriResponse> {
    const response = await this.webService.consultarAutorizacion(claveAcceso);
    return this.mapAutorizacionResponse(response);
  }

  private async firmarXml(xml: string): Promise<string> {
    return xml;
  }

  private extraerSecuencial(numeroFactura: string): string {
    const parts = numeroFactura.split('-');
    return parts[2] ?? '000000001';
  }

  private mapRecepcionResponse(response: SriRecepcionResponse): SriResponse {
    return {
      estado: response.estado === 'RECIBIDO' ? 'RECIBIDO' : 'RECHAZADO',
      numeroAutorizacion: response.numeroAutorizacion,
      fechaAutorizacion: response.fechaAutorizacion,
      mensajes: response.mensajes.map((m) => ({
        identificador: m.identificador,
        mensaje: m.mensaje,
        tipo: m.tipo,
      })),
    };
  }

  private mapAutorizacionResponse(response: SriAutorizacionResponse): SriResponse {
    return {
      estado: response.estado,
      numeroAutorizacion: response.numeroAutorizacion,
      fechaAutorizacion: response.fechaAutorizacion,
      mensajes: response.mensajes.map((m) => ({
        identificador: m.identificador,
        mensaje: m.mensaje,
        tipo: m.tipo,
      })),
    };
  }
}