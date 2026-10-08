import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * On client-side navigation, moves focus to the new page's heading (or the
 * main region while it loads) so keyboard and screen reader users start at
 * the new content, as they would after a full page load. New pages also
 * scroll to the top; back/forward keeps the browser's scroll position.
 */
const RouteChangeManager = ({ mainId }: { mainId: string }) => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  // Tracks the last path so the initial render (and React's StrictMode
  // double-invoked effects) never steal focus.
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    if (navigationType !== "POP") window.scrollTo(0, 0);

    const main = document.getElementById(mainId);
    const heading = main?.querySelector<HTMLElement>("h1");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    } else {
      main?.focus({ preventScroll: true });
    }
  }, [pathname, navigationType, mainId]);

  return null;
};

export default RouteChangeManager;
