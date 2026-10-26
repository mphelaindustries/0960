import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

/**
 * Full-screen intro shown on every page load: the logo arrives from the
 * back (small, faint, blurred) and grows toward the viewer, then the
 * splash fades out into the site. Pure CSS drives the visuals so it runs
 * from the first paint; this component just removes the node afterwards.
 */
export function IntroSplash() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 2200);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  return (
    <div className="intro-splash" aria-hidden>
      <img src={logo} alt="" className="intro-logo" />
    </div>
  );
}
