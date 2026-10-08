import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * On client-side navigation, scrolls to the top and moves focus to the main
 * region so keyboard and screen reader users start at the new page's content
 * (browsers do this automatically only for full page loads).
 */
const RouteChangeManager = ({ mainId }: { mainId: string }) => {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById(mainId)?.focus({ preventScroll: true });
  }, [pathname, mainId]);

  return null;
};

export default RouteChangeManager;
