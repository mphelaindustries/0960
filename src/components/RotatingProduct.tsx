import { ClientOnly } from "@tanstack/react-router";
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/store";

const Scene = lazy(() => import("./RotatingShirtScene"));

class DisplayBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function RotatingProduct({ product, compact = false }: { product: Product; compact?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [rotating, setRotating] = useState(true);
  const [angle, setAngle] = useState(0);
  const [palette, setPalette] = useState<{ cloth: string; pedestal: string; accent: string; light: string }>();
  useEffect(() => {
    if (!container.current) return;
    const styles = getComputedStyle(container.current);
    const token = (name: string) => styles.getPropertyValue(name).trim();
    setPalette({ cloth: token("--shirt-cloth"), pedestal: token("--shirt-pedestal"), accent: token("--shirt-accent"), light: token("--shirt-light") });
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    setRotating(!motion.matches);
    const update = () => setRotating(!motion.matches);
    motion.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setActive(entry?.isIntersecting ?? false), { rootMargin: "100px" });
    observer.observe(container.current);
    return () => { observer.disconnect(); motion.removeEventListener("change", update); };
  }, []);
  const fallback = <img src={product.front} alt={product.name} className="h-full w-full object-contain" />;
  return (
    <div ref={container} className="relative h-full w-full" role="img" aria-label={`${product.name}, rotating front and back display on a pedestal`}>
      <DisplayBoundary fallback={fallback}>
        <ClientOnly fallback={fallback}>
          <Suspense fallback={fallback}>
            {palette && <Scene frontArtwork={product.frontArtwork} backArtwork={product.backArtwork} palette={palette} rotating={rotating && active} angle={angle} compact={compact} />}
          </Suspense>
        </ClientOnly>
      </DisplayBoundary>
      {!compact && <div className="absolute bottom-12 right-5 z-10 flex gap-2">
        <Button variant="outline" size="icon" className="border-line bg-ink text-ink-foreground" aria-label={rotating ? "Pause rotation" : "Start rotation"} title={rotating ? "Pause rotation" : "Start rotation"} onClick={() => setRotating(!rotating)}>{rotating ? <Pause /> : <Play />}</Button>
        <Button variant="outline" size="icon" className="border-line bg-ink text-ink-foreground" aria-label="Show back design" title="Show back design" onClick={() => { setRotating(false); setAngle(angle === 0 ? Math.PI : 0); }}><RotateCcw /></Button>
      </div>}
    </div>
  );
}