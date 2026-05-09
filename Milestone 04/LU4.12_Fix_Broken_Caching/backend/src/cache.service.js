const cache = new Map();

function get(key) {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function set(key, value, ttlSeconds = 60) {
  const expiry = Date.now() + ttlSeconds * 1000;
  cache.set(key, { value, expiry });
}

function invalidate(key) {
  cache.delete(key);
}

function clear() {
  cache.clear();
}

module.exports = {
  get,
  set,
  invalidate,
  clear
};
