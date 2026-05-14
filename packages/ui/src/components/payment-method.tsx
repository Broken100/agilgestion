import { Button } from './button';

interface PaymentMethodProps {
  method: 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA' | 'CHEQUE';
  selected: boolean;
  onSelect: () => void;
}

const methodLabels: Record<PaymentMethodProps['method'], string> = {
  EFECTIVO: 'Efectivo',
  TARJETA_CREDITO: 'Tarjeta Credito',
  TARJETA_DEBITO: 'Tarjeta Debito',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE: 'Cheque',
};

export function PaymentMethod({ method, selected, onSelect }: PaymentMethodProps) {
  return (
    <Button
      variant={selected ? 'primary' : 'outline'}
      onClick={onSelect}
      className="flex w-full items-center justify-center rounded-lg border p-4 min-h-[56px] text-base font-medium"
    >
      {methodLabels[method]}
    </Button>
  );
}