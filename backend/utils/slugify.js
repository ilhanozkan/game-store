// Matches lowercase, hyphen-separated slugs such as "vr-glasses".
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugify = (value = "") =>
  String(value)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

module.exports = { slugify, SLUG_PATTERN };
