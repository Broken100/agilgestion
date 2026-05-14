// packages/sri/src/xml/FacturaXmlBuilder.ts
import type { Venta, Cliente } from '@agilgestion/domain';

export interface BusinessInfo {
  ruc: string;
  nombre: string;
  nombreComercial?: string | null;
  direccion?: string | null;
  ambienteSri?: string | null;
}

export interface FacturaXmlInput {
  venta: Venta;
  cliente: Cliente | null;
  business: BusinessInfo;
  claveAcceso: string;
}

export class FacturaXmlBuilder {
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  build(input: FacturaXmlInput): string {
    const { venta, cliente, business, claveAcceso } = input;
    const ambiente = business.ambienteSri === 'PRODUCCION' ? '1' : '2';
    const tipoEmision = '1';
    const codDoc = '01';

    const [estab, ptoEmi, secuencial] = venta.numeroFactura.split('-');

    const infoTributaria = this.buildInfoTributaria(
      ambiente,
      tipoEmision,
      business.nombre,
      business.nombreComercial ?? business.nombre,
      business.ruc,
      claveAcceso,
      codDoc,
      estab ?? '001',
      ptoEmi ?? '001',
      secuencial ?? '000000001',
      business.direccion ?? ''
    );

    const infoFactura = this.buildInfoFactura(
      venta,
      cliente,
      business,
      this.formatDate(venta.fecha),
      this.formatTime(venta.fecha)
    );

    const detalles = this.buildDetalles(venta);

    return `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="1.1.0">
${infoTributaria}
${infoFactura}
${detalles}
</factura>`;
  }

  private buildInfoTributaria(
    ambiente: string,
    tipoEmision: string,
    razonSocial: string,
    nombreComercial: string,
    ruc: string,
    claveAcceso: string,
    codDoc: string,
    estab: string,
    ptoEmi: string,
    secuencial: string,
    dirMatriz: string
  ): string {
    return `  <infoTributaria>
    <ambiente>${ambiente}</ambiente>
    <tipoEmision>${tipoEmision}</tipoEmision>
    <razonSocial>${this.escapeXml(razonSocial)}</razonSocial>
    <nombreComercial>${this.escapeXml(nombreComercial)}</nombreComercial>
    <ruc>${ruc}</ruc>
    <claveAcceso>${claveAcceso}</claveAcceso>
    <codDoc>${codDoc}</codDoc>
    <estab>${estab}</estab>
    <ptoEmi>${ptoEmi}</ptoEmi>
    <secuencial>${secuencial}</secuencial>
    <dirMatriz>${this.escapeXml(dirMatriz)}</dirMatriz>
  </infoTributaria>`;
  }

  private buildInfoFactura(
    venta: Venta,
    cliente: Cliente | null,
    business: BusinessInfo,
    fechaEmision: string,
    horaEmision: string
  ): string {
    const dirEstablecimiento = business.direccion ?? '';
    const obligadoContabilidad = 'NO';

    const tipoIdentificacion = cliente?.tipoIdentificacion ?? '04';
    const razonSocialComprador = cliente?.razonSocial ?? 'CONSUMIDOR FINAL';
    const identificacionComprador = cliente?.identificacion ?? '9999999999999';
    const direccionComprador = cliente?.direccion ?? '';

    const totalSinImpuesto = venta.subtotal.toFixed(2);
    const totalDescuento = venta.descuentoTotal.toFixed(2);

    const totalImpuesto = this.buildTotalImpuesto(venta);

    const importeTotal = venta.total.toFixed(2);
    const moneda = 'USD';

    return `  <infoFactura>
    <fechaEmision>${fechaEmision}</fechaEmision>
    <horaEmision>${horaEmision}</horaEmision>
    <dirEstablecimiento>${this.escapeXml(dirEstablecimiento)}</dirEstablecimiento>
    <obligadoContabilidad>${obligadoContabilidad}</obligadoContabilidad>
    <tipoIdentificacionComprador>${tipoIdentificacion}</tipoIdentificacionComprador>
    <razonSocialComprador>${this.escapeXml(razonSocialComprador)}</razonSocialComprador>
    <identificacionComprador>${identificacionComprador}</identificacionComprador>
    <direccionComprador>${this.escapeXml(direccionComprador)}</direccionComprador>
    <totalSinImpuesto>${totalSinImpuesto}</totalSinImpuesto>
    <totalDescuento>${totalDescuento}</totalDescuento>
${totalImpuesto}
    <importeTotal>${importeTotal}</importeTotal>
    <moneda>${moneda}</moneda>
  </infoFactura>`;
  }

  private buildTotalImpuesto(venta: Venta): string {
    const iva15Lines = venta.lineas.filter(l => l.porcentajeImpuesto === 15);
    const iva0Lines = venta.lineas.filter(l => l.porcentajeImpuesto === 0);
    const iceLines = venta.lineas.filter(l => l.porcentajeImpuesto === 10);

    let result = '    <totalImpuesto>';

    if (iva15Lines.length > 0) {
      const baseImponible = iva15Lines.reduce((sum, l) => sum + l.subtotalLinea, 0).toFixed(2);
      const valor = iva15Lines.reduce((sum, l) => sum + l.impuestoLinea, 0).toFixed(2);
      result += `
      <impuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>2</codigoPorcentaje>
        <baseImponible>${baseImponible}</baseImponible>
        <valor>${valor}</valor>
      </impuesto>`;
    }

    if (iva0Lines.length > 0) {
      const baseImponible = iva0Lines.reduce((sum, l) => sum + l.subtotalLinea, 0).toFixed(2);
      const valor = '0.00';
      result += `
      <impuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>0</codigoPorcentaje>
        <baseImponible>${baseImponible}</baseImponible>
        <valor>${valor}</valor>
      </impuesto>`;
    }

    if (iceLines.length > 0) {
      const baseImponible = iceLines.reduce((sum, l) => sum + l.subtotalLinea, 0).toFixed(2);
      const valor = iceLines.reduce((sum, l) => sum + l.impuestoLinea, 0).toFixed(2);
      result += `
      <impuesto>
        <codigo>3</codigo>
        <codigoPorcentaje>2</codigoPorcentaje>
        <baseImponible>${baseImponible}</baseImponible>
        <valor>${valor}</valor>
      </impuesto>`;
    }

    result += `
    </totalImpuesto>`;
    return result;
  }

  private buildDetalles(venta: Venta): string {
    let xml = '  <detalles>';

    for (const linea of venta.lineas) {
      xml += `
    <detalle>
      <codigoPrincipal>${this.escapeXml(linea.productoCodigo)}</codigoPrincipal>
      <descripcion>${this.escapeXml(linea.productoNombre)}</descripcion>
      <cantidad>${linea.cantidad}</cantidad>
      <precioUnitario>${linea.precioUnitario.toFixed(2)}</precioUnitario>
      <descuento>${linea.descuento.toFixed(2)}</descuento>
      <precioTotalSinImpuesto>${linea.subtotalLinea.toFixed(2)}</precioTotalSinImpuesto>
${this.buildImpuestosDetalle(linea)}
    </detalle>`;
    }

    xml += `
  </detalles>`;
    return xml;
  }

  private buildImpuestosDetalle(linea: Venta['lineas'][0]): string {
    if (linea.porcentajeImpuesto === 0) {
      return `      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>0</codigoPorcentaje>
          <baseImponible>${linea.subtotalLinea.toFixed(2)}</baseImponible>
          <valor>0.00</valor>
        </impuesto>
      </impuestos>`;
    }

    const codigo = linea.porcentajeImpuesto === 15 ? '2' : '3';
    const codigoPorcentaje = linea.porcentajeImpuesto === 15 ? '2' : '2';

    return `      <impuestos>
        <impuesto>
          <codigo>${codigo}</codigo>
          <codigoPorcentaje>${codigoPorcentaje}</codigoPorcentaje>
          <baseImponible>${linea.subtotalLinea.toFixed(2)}</baseImponible>
          <valor>${linea.impuestoLinea.toFixed(2)}</valor>
        </impuesto>
      </impuestos>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}