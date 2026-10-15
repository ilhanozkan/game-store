// True for 24-character hex strings such as "6ac7cfe17bdd3029032f375b".
// Stricter than mongoose.isValidObjectId, which accepts any 12-character string.
const isObjectId = (value) =>
  typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);

module.exports = { isObjectId };
