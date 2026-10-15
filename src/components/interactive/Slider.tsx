interface Props {
  label: string;
  value: number;
  onInput: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Digits shown in the readout. */
  digits?: number;
}

export default function Slider({ label, value, onInput, min, max, step = 0.01, digits = 2 }: Props) {
  return (
    <label class="ix-slider">
      <span class="label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(e) => onInput(parseFloat((e.target as HTMLInputElement).value))}
      />
      <output>{value.toFixed(digits)}</output>
    </label>
  );
}
