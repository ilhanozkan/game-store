// localStorage can throw (private mode, disabled storage), so every access is
// guarded and failures fall back to "nothing stored".

export const readStorage = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (key: string, value: string | null) => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Ignore: persistence is a convenience, not a requirement.
  }
};

const TOKEN_KEY = "game-store:token";

export const getToken = () => readStorage(TOKEN_KEY);
export const setToken = (token: string | null) =>
  writeStorage(TOKEN_KEY, token);
