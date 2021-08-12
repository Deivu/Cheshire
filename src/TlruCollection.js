const { Constants } = require('discord.js');
const { Collection } = require('@discordjs/collection');
const { Scheduler } = require('fun-dispatcher');

const Defaults = { 
    maxStoreSize: Infinity, 
    maxAgeMs: 12 * 60 * 60 * 1000, 
    defaultLRU: true 
};

class TlruCollection extends Collection {
    constructor(options = {}) {
        super();
        this.maxStoreSize = options.maxStoreSize || Defaults.maxStoreSize;
        this.maxAgeMs = options.maxAgeMs || Defaults.maxAgeMs;
        this.defaultLRU = options.defaultLRU || Defaults.defaultLRU;
        Object.defineProperty(this, 'scheduler', { value: new Scheduler() });
    }

    set(key, value, ttuMs = this.maxAgeMs + this.size) {
        if (this.size >= this.maxStoreSize) this.scheduler.runNext();
        this.scheduler.schedule(String(key), () => super.delete(key), ttuMs);
        return super.set(key, value);
    }

    get(key, revive = this.defaultLRU) {
        if (this.has(key)) {
            if (revive) {
                const original = this.scheduler.get(String(key));
                if (original)
                    this.scheduler.schedule(String(key), () => super.delete(key), original.delay + super.size);
            }
            return super.get(key);
        }
        return undefined;
    }

    delete(key) {
        this.scheduler.delete(String(key));
        return super.delete(key);
    }
    
    clear() {
        this.scheduler.flush();
        super.clear();
    }
    
    [Constants._cleanupSymbol]() {
        return () => this.scheduler.flush();
    }
}

module.exports = TlruCollection;
