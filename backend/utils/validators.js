// Money is stored in whole Naira, so amounts must be safe integers.
const wholeNaira = {
  validator: Number.isSafeInteger,
  message: "{PATH} must be a whole number of Naira",
};

// Images are either paths served by the frontend ("/images/...") or
// http(s) URLs. Anything else (e.g. "javascript:") is rejected.
const IMAGE_URL_PATTERN = /^(?:\/(?!\/)|https?:\/\/)\S*$/i;

const imageUrl = {
  validator: (value) => !value || IMAGE_URL_PATTERN.test(value),
  message: "{PATH} must be a path starting with / or an http(s) URL",
};

module.exports = { wholeNaira, imageUrl };
