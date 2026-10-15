import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * requestAnimationFrame loop for live animations.
 * `onFrame(dt)` is called every frame while playing (dt in seconds, capped).
 * Starts paused when the reader prefers reduced motion, and pauses when off-screen.
 */
export function usePlayer(onFrame: (dt: number) => void, target?: { current: Element | null }) {
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(true);
  const cb = useRef(onFrame);
  cb.current = onFrame;

  useEffect(() => {
    setPlaying(!matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const el = target?.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  useEffect(() => {
    if (!playing || !visible) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      cb.current(Math.min((now - last) / 1000, 1 / 20));
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, visible]);

  return { playing, toggle: () => setPlaying((p) => !p), setPlaying };
}

export function PlayButton({ playing, onClick }: { playing: boolean; onClick: () => void }) {
  return (
    <button type="button" class="ix-button primary" onClick={onClick} aria-label={playing ? 'Pause' : 'Play'}>
      {playing ? (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" fill="currentColor" /><rect x="7" y="1.5" width="3" height="9" rx="1" fill="currentColor" /></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /></svg>
      )}
      {playing ? 'Pause' : 'Play'}
    </button>
  );
}
