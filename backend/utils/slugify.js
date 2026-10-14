// Matches lowercase, hyphen-separated slugs such as "vr-glasses".
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugify = (value = "") =>
  String(value)
    .normalize("NFKD")
    // Drop the accents that NFKD splits off, so "Pokémon" becomes "pokemon".
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

module.exports = { slugify, SLUG_PATTERN };
