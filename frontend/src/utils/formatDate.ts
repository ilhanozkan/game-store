const DateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// Formats ISO timestamps from the API, e.g. "8 Oct 2026".
const formatDate = (value: string): string =>
  DateFormat.format(new Date(value));

export default formatDate;
