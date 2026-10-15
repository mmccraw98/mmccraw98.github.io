import { useEffect, useRef, useState } from 'preact/hooks';
import * as Plot from '@observablehq/plot';
import { useChartTheme, type ChartTheme } from './theme';

interface Props {
  /** Build the Plot options. Called again whenever deps, width, or theme change. */
  options: (ctx: { width: number; theme: ChartTheme }) => Plot.PlotOptions;
  height?: number;
  /** Values that should trigger a redraw (slider states etc.). */
  deps: unknown[];
}

/**
 * Responsive, theme-aware wrapper around Observable Plot
 * (https://observablehq.com/plot/). Hover tooltips come from Plot's `tip` option.
 */
export default function PlotView({ options, height = 320, deps }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const theme = useChartTheme();

  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !width || !theme) return;
    const opts = options({ width, theme });
    const chart = Plot.plot({
      width,
      height,
      marginLeft: 48,
      style: {
        background: 'transparent',
        color: theme.ink2,
        fontFamily: theme.font,
        fontSize: '12px',
        overflow: 'visible',
      },
      ...opts,
    });
    el.replaceChildren(chart);
    return () => chart.remove();
  }, [width, theme, height, ...deps]);

  return <div ref={ref} style={{ width: '100%', minHeight: height }} />;
}

export { Plot };

/** Shared axis/grid styling so every chart reads as one system. */
export const axes = (theme: ChartTheme) => [
  Plot.gridY({ stroke: theme.grid, strokeOpacity: 1 }),
  Plot.ruleY([0], { stroke: theme.axis }),
];
