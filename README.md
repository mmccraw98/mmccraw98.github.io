# mmccraw98.github.io

Personal academic site and project portfolio, built with [Astro](https://astro.build) + MDX.
Projects are written like interactive notebooks: LaTeX math, collapsible derivations,
plots with sliders, and live or pre-rendered animations.

## Run locally

```sh
npm install
npm run dev        # http://localhost:4321, live-reloads as you edit
npm run build      # production build into dist/
```

## Edit your info

Everything about you (name, position, bio, links, CV) lives in `src/site.config.ts`.

## Add a project

Each project is a folder in `src/content/projects/`. The quickest start is to copy an example:

```
src/content/projects/my-project/
├── index.mdx          # the write-up
├── cover.png          # optional card image (set `cover: ./cover.png` in frontmatter)
└── figures/           # interactive figures for this project (.tsx)
```

Frontmatter fields: `title`, `summary`, `date`, `tags`, `featured` (shows on the home page),
`draft` (hidden in production, visible in `npm run dev`), `cover`, `links`.

### Building blocks you can use in `index.mdx`

| What | How |
|---|---|
| Math | `$inline$` and `$$display$$` LaTeX (KaTeX). Number with `\tag{1}`. |
| Collapsible derivation | `<Derivation title="...">...math...</Derivation>` |
| Highlighted result / note | `<Callout kind="result" title="Result">...</Callout>` |
| Numbered figure + caption | `<Figure caption="...">...</Figure>` (figures auto-number) |
| Static image | Markdown `![alt](./plot.png)` inside a `<Figure>` |
| Pre-rendered animation | `<Video src="/media/my-project/anim.mp4" />` (file in `public/media/`) |
| Interactive plot / live sim | A `.tsx` component in `figures/`, used as `<MyFig client:visible />` |

Import components at the top of the `.mdx` (see the examples).

### Interactive figures

Figures are small [Preact](https://preactjs.com) components that use a shared kit in
`src/components/interactive/`:

- `PlotView` wraps [Observable Plot](https://observablehq.com/plot/), responsive and themed for light/dark.
- `Slider` is a labeled range input with a value readout.
- `usePlayer` + `PlayButton` give you a requestAnimationFrame loop for live simulations.
  It pauses off-screen and respects reduced-motion settings.

Minimal pattern:

```tsx
import { useState } from 'preact/hooks';
import PlotView, { Plot, axes } from '../../../../components/interactive/PlotView';
import Slider from '../../../../components/interactive/Slider';

export default function Sine() {
  const [k, setK] = useState(1);
  const data = Array.from({ length: 200 }, (_, i) => ({ x: i / 20, y: Math.sin(k * i / 20) }));
  return (
    <div class="ix">
      <div class="ix-controls"><Slider label="k" value={k} onInput={setK} min={0} max={5} /></div>
      <PlotView deps={[k]} options={({ theme }) => ({
        marks: [...axes(theme), Plot.line(data, { x: 'x', y: 'y', stroke: theme.series[0] })],
      })} />
    </div>
  );
}
```

### Using results from Python / Julia / MATLAB

- **Animations:** `anim.save("public/media/my-project/anim.mp4", fps=30)` in matplotlib, then `<Video>`.
- **Plots of heavy computations:** export the data (`json.dump(...)` or `.to_json()`) to
  `src/content/projects/my-project/data.json`, then `import data from './data.json'` in a figure
  and plot it with `PlotView`. Sliders can then index into precomputed parameter sweeps.
- **Cheap models:** re-implement the formula in TypeScript, as the oscillator example does, so the
  sliders recompute live.

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes the site.
One-time setup: on GitHub, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
