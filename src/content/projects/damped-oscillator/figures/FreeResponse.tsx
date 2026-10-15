import { useState } from 'preact/hooks';
import PlotView, { Plot, axes } from '../../../../components/interactive/PlotView';
import Slider from '../../../../components/interactive/Slider';
import { freeResponse, regime } from './physics';

export default function FreeResponse() {
  const [zeta, setZeta] = useState(0.15);
  const [w0, setW0] = useState(2);

  const T = 15;
  const data = Array.from({ length: 601 }, (_, i) => {
    const t = (i / 600) * T;
    return { t, x: freeResponse(t, zeta, w0), env: Math.exp(-zeta * w0 * t) };
  });
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;

  return (
    <div class="ix">
      <div class="ix-controls">
        <Slider label="damping ratio ζ" value={zeta} onInput={setZeta} min={0} max={2.5} step={0.01} />
        <Slider label="natural freq. ω₀" value={w0} onInput={setW0} min={0.5} max={4} step={0.05} />
      </div>
      <div class="ix-readout">
        {regime(zeta)}
        {zeta < 1 && ` · ω_d = ${wd.toFixed(3)} · decay time 1/ζω₀ = ${zeta > 0 ? (1 / (zeta * w0)).toFixed(2) : '∞'}`}
      </div>
      <PlotView
        height={300}
        deps={[zeta, w0]}
        options={({ theme }) => ({
          x: { label: 'time t', domain: [0, T] },
          y: { label: 'displacement x(t) / x₀', domain: [-1.05, 1.05] },
          marks: [
            ...axes(theme),
            zeta < 1 && Plot.line(data, { x: 't', y: 'env', stroke: theme.muted, strokeDasharray: '4 4', strokeWidth: 1 }),
            zeta < 1 && Plot.line(data, { x: 't', y: (d) => -d.env, stroke: theme.muted, strokeDasharray: '4 4', strokeWidth: 1 }),
            Plot.line(data, { x: 't', y: 'x', stroke: theme.series[0], strokeWidth: 2 }),
            Plot.tip(data, Plot.pointerX({ x: 't', y: 'x', format: { x: '.2f', y: '.3f' } })),
            Plot.dot(data, Plot.pointerX({ x: 't', y: 'x', r: 4, fill: theme.series[0], stroke: theme.surface, strokeWidth: 2 })),
          ],
        })}
      />
    </div>
  );
}
