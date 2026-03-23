class Cache {
  constructor(ttlSeconds = 300) {
    this.ttl = ttlSeconds * 1000;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.store.set(key, { value, timestamp: Date.now() });
  }

  clear() {
    this.store.clear();
  }
}

module.exports = Cache;
