import { useState } from 'preact/hooks';
import PlotView, { Plot, axes } from '../../../../components/interactive/PlotView';
import Slider from '../../../../components/interactive/Slider';
import { gain, phase } from './physics';

export default function Resonance() {
  const [zeta, setZeta] = useState(0.2);

  const data = Array.from({ length: 401 }, (_, i) => {
    const r = (i / 400) * 3;
    return { r, gain: gain(r, zeta), phase: (phase(r, zeta) * 180) / Math.PI };
  });
  const hasPeak = zeta < Math.SQRT1_2;
  const rPeak = hasPeak ? Math.sqrt(1 - 2 * zeta * zeta) : 0;
  const peak = [{ r: rPeak, gain: gain(rPeak, zeta) }];

  return (
    <div class="ix">
      <div class="ix-controls">
        <Slider label="damping ratio ζ" value={zeta} onInput={setZeta} min={0.03} max={1.5} step={0.01} />
        <span class="ix-readout">
          {hasPeak
            ? `peak at Ω/ω₀ = ${rPeak.toFixed(3)}, gain = ${peak[0].gain.toFixed(2)}`
            : 'ζ ≥ 1/√2: no resonant peak'}
        </span>
      </div>
      <div class="ix-row cols-2">
        <PlotView
          height={260}
          deps={[zeta]}
          options={({ theme }) => ({
            x: { label: 'drive frequency Ω / ω₀' },
            y: { label: 'gain X / (F₀/k)', type: 'log', domain: [0.1, 20], grid: true, ticks: [0.1, 0.2, 0.5, 1, 2, 5, 10, 20], tickFormat: '~g' },
            marks: [
              Plot.ruleY([1], { stroke: theme.axis }),
              Plot.line(data, { x: 'r', y: 'gain', stroke: theme.series[0], strokeWidth: 2 }),
              hasPeak && Plot.dot(peak, { x: 'r', y: 'gain', r: 5, fill: theme.series[0], stroke: theme.surface, strokeWidth: 2 }),
              Plot.tip(data, Plot.pointerX({ x: 'r', y: 'gain', format: { x: '.2f', y: '.3f' } })),
            ],
          })}
        />
        <PlotView
          height={260}
          deps={[zeta]}
          options={({ theme }) => ({
            x: { label: 'drive frequency Ω / ω₀' },
            y: { label: 'phase lag φ (deg)', domain: [0, 180], ticks: [0, 45, 90, 135, 180] },
            marks: [
              ...axes(theme),
              Plot.ruleX([1], { stroke: theme.axis, strokeDasharray: '3 3' }),
              Plot.line(data, { x: 'r', y: 'phase', stroke: theme.series[0], strokeWidth: 2 }),
              Plot.tip(data, Plot.pointerX({ x: 'r', y: 'phase', format: { x: '.2f', y: '.1f' } })),
            ],
          })}
        />
      </div>
    </div>
  );
}
