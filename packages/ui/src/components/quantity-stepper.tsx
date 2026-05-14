import { Button } from './button';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 9999 }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => value > min && onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="h-8 w-8 p-0 min-h-[44px] min-w-[44px]"
      >
        −
      </Button>
      <span className="w-12 text-center font-medium tabular-nums">{value}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => value < max && onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="h-8 w-8 p-0 min-h-[44px] min-w-[44px]"
      >
        +
      </Button>
    </div>
  );
}