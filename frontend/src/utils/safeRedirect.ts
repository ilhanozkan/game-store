// Only allow redirects to paths inside the app ("/cart"), never to other
// origins ("//evil.example" or "https://...").
const safeRedirect = (value: string | null, fallback = "/"): string =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;

export default safeRedirect;
