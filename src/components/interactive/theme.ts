import { useEffect, useState } from 'preact/hooks';

export interface ChartTheme {
  series: string[];
  ink: string;
  ink2: string;
  muted: string;
  grid: string;
  axis: string;
  surface: string;
  accent: string;
  font: string;
}

function read(): ChartTheme {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  return {
    series: [v('--series-1'), v('--series-2'), v('--series-3'), v('--series-4')],
    ink: v('--ink'),
    ink2: v('--ink-2'),
    muted: v('--chart-muted'),
    grid: v('--chart-grid'),
    axis: v('--chart-axis'),
    surface: v('--surface'),
    accent: v('--accent'),
    font: v('--font-sans'),
  };
}

/** Current chart colors from the CSS tokens; re-renders when light/dark changes. */
export function useChartTheme(): ChartTheme | null {
  const [theme, setTheme] = useState<ChartTheme | null>(null);
  useEffect(() => {
    const update = () => setTheme(read());
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', update);
    return () => {
      mo.disconnect();
      mq.removeEventListener('change', update);
    };
  }, []);
  return theme;
}
