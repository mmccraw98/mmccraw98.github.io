import { useRef, useState } from 'preact/hooks';
import Slider from '../../../../components/interactive/Slider';
import { usePlayer, PlayButton } from '../../../../components/interactive/usePlayer';

const W0 = Math.PI; // natural frequency: one period every 2 s of animation
const HISTORY = 12; // seconds of trace shown
const DT = 1 / 240;

interface State {
  t: number;
  x: number;
  v: number;
  trace: { t: number; x: number; f: number }[];
}
const initial = (): State => ({ t: 0, x: 0, v: 0, trace: [] });

/** Live RK4 integration of x'' + 2ζω₀x' + ω₀²x = ω₀² cos(Ωt), drawn as a spring-mass + trace. */
export default function DrivenAnimation() {
  const [zeta, setZeta] = useState(0.08);
  const [ratio, setRatio] = useState(0.9);
  const [, force] = useState(0);
  const sim = useRef<State>(initial());
  const root = useRef<HTMLDivElement>(null);

  const accel = (t: number, x: number, v: number) =>
    W0 * W0 * Math.cos(ratio * W0 * t) - 2 * zeta * W0 * v - W0 * W0 * x;

  const { playing, toggle } = usePlayer((dt) => {
    const s = sim.current;
    for (let n = Math.round(dt / DT); n > 0; n--) {
      const { t, x, v } = s;
      const k1x = v, k1v = accel(t, x, v);
      const k2x = v + (DT / 2) * k1v, k2v = accel(t + DT / 2, x + (DT / 2) * k1x, v + (DT / 2) * k1v);
      const k3x = v + (DT / 2) * k2v, k3v = accel(t + DT / 2, x + (DT / 2) * k2x, v + (DT / 2) * k2v);
      const k4x = v + DT * k3v, k4v = accel(t + DT, x + DT * k3x, v + DT * k3v);
      s.x += (DT / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
      s.v += (DT / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
      s.t += DT;
    }
    s.trace.push({ t: s.t, x: s.x, f: Math.cos(ratio * W0 * s.t) });
    while (s.trace.length && s.trace[0].t < s.t - HISTORY) s.trace.shift();
    force((n) => n + 1);
  }, root);

  const reset = () => {
    sim.current = initial();
    force((n) => n + 1);
  };

  const { t, x, trace } = sim.current;
  // Geometry (SVG user units)
  const W = 640, H = 240, springH = 90, yScale = 12;
  const clampX = Math.max(-8, Math.min(8, x));
  const wall = 30, rest = 200, massW = 46;
  const massX = rest + clampX * yScale;
  const coils = 14;
  const springPts = Array.from({ length: coils * 2 + 1 }, (_, i) => {
    const px = wall + ((massX - wall) * i) / (coils * 2);
    const py = springH / 2 + (i === 0 || i === coils * 2 ? 0 : i % 2 ? -10 : 10);
    return `${px.toFixed(1)},${py}`;
  }).join(' ');

  // trace panel
  const tx0 = 370, tx1 = W - 10, ty = springH / 2;
  const traceY = (v: number) => ty - Math.max(-8, Math.min(8, v)) * 5;
  const traceX = (tt: number) => tx1 - ((t - tt) / HISTORY) * (tx1 - tx0);
  const line = (key: 'x' | 'f') => trace.map((p) => `${traceX(p.t).toFixed(1)},${traceY(p[key]).toFixed(1)}`).join(' ');

  return (
    <div class="ix" ref={root}>
      <div class="ix-controls">
        <PlayButton playing={playing} onClick={toggle} />
        <button type="button" class="ix-button" onClick={reset}>Reset</button>
        <Slider label="damping ζ" value={zeta} onInput={setZeta} min={0.01} max={1} step={0.01} />
        <Slider label="drive Ω/ω₀" value={ratio} onInput={setRatio} min={0.2} max={2.5} step={0.01} />
      </div>
      <div class="ix-legend">
        <span><i style={{ background: 'var(--series-1)' }} />response x(t)</span>
        <span><i style={{ background: 'var(--series-2)' }} />drive F(t)/k</span>
        <span class="ix-readout">t = {t.toFixed(1)} s</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H / 2 + 10}`} width="100%" role="img" aria-label="Animated mass on a spring with a trace of its displacement">
        <line x1={wall} y1={10} x2={wall} y2={springH - 10} stroke="var(--ink-3)" stroke-width="3" />
        <line x1={rest} y1={springH / 2 + 32} x2={rest} y2={springH / 2 + 40} stroke="var(--ink-3)" />
        <polyline points={springPts} fill="none" stroke="var(--ink-2)" stroke-width="1.5" stroke-linejoin="round" />
        <rect x={massX} y={springH / 2 - 22} width={massW} height={44} rx="6" fill="var(--series-1)" />
        <line x1={tx0} y1={ty} x2={tx1} y2={ty} stroke="var(--chart-axis)" />
        <polyline points={line('f')} fill="none" stroke="var(--series-2)" stroke-width="1.5" stroke-dasharray="4 3" />
        <polyline points={line('x')} fill="none" stroke="var(--series-1)" stroke-width="2" />
        <text x={tx0} y={springH + 6} fill="var(--ink-3)" font-size="11">−{HISTORY} s</text>
        <text x={tx1} y={springH + 6} fill="var(--ink-3)" font-size="11" text-anchor="end">now</text>
      </svg>
    </div>
  );
}
