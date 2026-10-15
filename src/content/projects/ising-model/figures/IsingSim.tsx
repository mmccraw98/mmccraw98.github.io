import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import PlotView, { Plot, axes } from '../../../../components/interactive/PlotView';
import Slider from '../../../../components/interactive/Slider';
import { usePlayer, PlayButton } from '../../../../components/interactive/usePlayer';
import { useChartTheme } from '../../../../components/interactive/theme';

const L = 96;
const TC = 2 / Math.log(1 + Math.SQRT2);

/** Onsager's exact spontaneous magnetization of the 2D square-lattice Ising model (J = k_B = 1). */
const onsager = (T: number) => (T >= TC ? 0 : Math.pow(1 - Math.pow(Math.sinh(2 / T), -4), 1 / 8));

const randomSpins = () => Int8Array.from({ length: L * L }, () => (Math.random() < 0.5 ? 1 : -1));

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const n = parseInt(m.length === 3 ? m.replace(/./g, '$&$&') : m, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function IsingSim() {
  const [T, setT] = useState(2.0);
  const [sweepsPerFrame, setSweeps] = useState(2);
  const [mag, setMag] = useState({ m: 0, avg: 0 });
  const spins = useRef(randomSpins());
  const history = useRef<number[]>([]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const theme = useChartTheme();
  const frame = useRef(0);

  // Acceptance probabilities for ΔE ∈ {4, 8} (J = 1, h = 0); ΔE ≤ 0 is always accepted.
  const accept = useMemo(() => [Math.exp(-4 / T), Math.exp(-8 / T)], [T]);

  const draw = () => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx || !theme) return;
    const img = ctx.createImageData(L, L);
    const up = hexToRgb(theme.series[0]);
    const down = hexToRgb(theme.surface);
    const s = spins.current;
    for (let i = 0; i < L * L; i++) {
      const c = s[i] > 0 ? up : down;
      img.data.set([c[0], c[1], c[2], 255], i * 4);
    }
    ctx.putImageData(img, 0, 0);
  };

  useEffect(draw, [theme]);
  useEffect(() => {
    history.current = [];
  }, [T]);

  const { playing, toggle } = usePlayer(() => {
    const s = spins.current;
    for (let n = 0; n < sweepsPerFrame * L * L; n++) {
      const i = (Math.random() * L) | 0;
      const j = (Math.random() * L) | 0;
      const k = i * L + j;
      const nb =
        s[((i + 1) % L) * L + j] + s[((i - 1 + L) % L) * L + j] + s[i * L + ((j + 1) % L)] + s[i * L + ((j - 1 + L) % L)];
      const dE = 2 * s[k] * nb; // ∈ {-8, -4, 0, 4, 8}
      if (dE <= 0 || Math.random() < accept[dE / 4 - 1]) s[k] = -s[k] as 1 | -1;
    }
    draw();
    let sum = 0;
    for (let k = 0; k < L * L; k++) sum += s[k];
    const m = Math.abs(sum) / (L * L);
    const h = history.current;
    h.push(m);
    if (h.length > 300) h.shift();
    if (++frame.current % 6 === 0) setMag({ m, avg: h.reduce((a, b) => a + b, 0) / h.length });
  }, root);

  const reset = (ordered: boolean) => {
    spins.current = ordered ? new Int8Array(L * L).fill(1) : randomSpins();
    history.current = [];
    draw();
  };

  const curve = useMemo(
    () => Array.from({ length: 300 }, (_, i) => { const t = 0.5 + (i / 299) * 4; return { T: t, M: onsager(t) }; }),
    [],
  );

  return (
    <div class="ix" ref={root}>
      <div class="ix-controls">
        <PlayButton playing={playing} onClick={toggle} />
        <button type="button" class="ix-button" onClick={() => reset(false)}>Randomize</button>
        <button type="button" class="ix-button" onClick={() => reset(true)}>All up</button>
      </div>
      <div class="ix-controls">
        <Slider label="temperature T" value={T} onInput={setT} min={0.5} max={4.5} step={0.01} />
        <Slider label="sweeps / frame" value={sweepsPerFrame} onInput={setSweeps} min={1} max={10} step={1} digits={0} />
      </div>
      <div class="ix-row cols-2">
        <div>
          <canvas
            ref={canvas}
            width={L}
            height={L}
            style={{ width: '100%', aspectRatio: '1', imageRendering: 'pixelated', borderRadius: '6px', border: '1px solid var(--rule)' }}
            aria-label={`${L} by ${L} spin lattice`}
          />
          <div class="ix-readout">
            T/T_c = {(T / TC).toFixed(3)} · |m| = {mag.m.toFixed(3)} · ⟨|m|⟩ = {mag.avg.toFixed(3)}
          </div>
        </div>
        <div>
          <div class="ix-legend">
            <span><i style={{ background: 'var(--series-1)' }} />Onsager exact M(T)</span>
            <span><i style={{ background: 'var(--series-2)', height: '8px', width: '8px', borderRadius: '50%' }} />simulation ⟨|m|⟩</span>
          </div>
          <PlotView
            height={300}
            deps={[T, mag.avg]}
            options={({ theme }) => ({
              x: { label: 'temperature T', domain: [0.5, 4.5] },
              y: { label: 'magnetization |m|', domain: [0, 1.05] },
              marks: [
                ...axes(theme),
                Plot.ruleX([TC], { stroke: theme.axis, strokeDasharray: '3 3' }),
                Plot.text([{ x: TC, y: 1.02 }], { x: 'x', y: 'y', text: () => 'T_c', dx: 14, fill: theme.muted }),
                Plot.line(curve, { x: 'T', y: 'M', stroke: theme.series[0], strokeWidth: 2 }),
                Plot.dot([{ T, M: mag.avg }], { x: 'T', y: 'M', r: 6, fill: theme.series[1], stroke: theme.surface, strokeWidth: 2 }),
                Plot.tip(curve, Plot.pointerX({ x: 'T', y: 'M', format: { x: '.2f', y: '.3f' } })),
              ],
            })}
          />
        </div>
      </div>
    </div>
  );
}
