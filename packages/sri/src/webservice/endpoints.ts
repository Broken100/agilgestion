// packages/sri/src/webservice/endpoints.ts
export const SRI_ENDPOINTS = {
  PRUEBAS: {
    recepcion: 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantes?wsdl',
    autorizacion: 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes?wsdl',
  },
  PRODUCCION: {
    recepcion: 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantes?wsdl',
    autorizacion: 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes?wsdl',
  },
} as const;

export type Ambiente = 'PRUEBAS' | 'PRODUCCION';

export function getSriEndpoints(ambiente: Ambiente) {
  return ambiente === 'PRODUCCION'
    ? SRI_ENDPOINTS.PRODUCCION
    : SRI_ENDPOINTS.PRUEBAS;
}