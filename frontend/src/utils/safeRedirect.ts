// Pages that make no sense to return to after signing in (and would leave
// the login form stuck on its "Signing in…" state).
const AUTH_PAGES = ["/login", "/register"];

/**
 * Only allows redirects to paths inside the app ("/cart"), never to other
 * origins. Resolving against the current origin catches tricks such as
 * "//evil.example", "/\evil.example" or "/\t/evil.example", which browsers
 * treat as protocol-relative URLs.
 */
const safeRedirect = (value: string | null, fallback = "/"): string => {
  if (!value || !value.startsWith("/")) return fallback;
  try {
    const { origin } = window.location;
    const url = new URL(value, origin);
    if (url.origin !== origin || AUTH_PAGES.includes(url.pathname)) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
};

export default safeRedirect;
