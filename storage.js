export function readStoredValue(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStoredValue(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Ignore unavailable storage and keep the UI working.
  }
}