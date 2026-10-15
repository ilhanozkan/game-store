import { useEffect } from "react";

const SITE_NAME = "Game Drill";

/**
 * Sets the browser tab title, e.g. "Cart · Game Drill". Pass null for just
 * the site name, or undefined to leave the title alone (for example while
 * data is loading, or when a child component sets it).
 */
const usePageTitle = (title?: string | null) => {
  useEffect(() => {
    if (title === undefined) return;
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  }, [title]);
};

export default usePageTitle;
