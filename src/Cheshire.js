const { Collection } = require('@discordjs/collection');
const { Scheduler } = require('fun-dispatcher');

class Options {
    constructor(options = {}) {
        this.limit = options.limit || Infinity;
        this.lifetime = options.lifetime || 12 * 60 * 60 * 1000;
        this.executor = options.executor || null;
        this.lru = options.lru || false;
        if (isNaN(this.limit)) throw new Error('Option limit must be a number');
        if (isNaN(this.lifetime)) throw new Error('Option lifetime must be a number');
        if (this.executor && typeof this.executor !== 'function') throw new Error('Option executor must be a function');
    }
}

class Cheshire extends Collection {
    constructor(options = {}) {
        super();
        Object.defineProperty(this, 'options', { value: new Options(options) });
        Object.defineProperty(this, 'scheduler', { value: new Scheduler() });
    }

    set(key, value, ttu = this.options.lifetime + this.size) {
        if (this.size > this.options.limit) this.scheduler.runNext();
        this.scheduler.schedule(key, () => {
            const data = this.get(key);
            if (data && this.options.executor) this.options.executor(data);
            super.delete(key);
        }, ttu);
        return super.set(key, value);
    }

    get(key, revive = this.options.lru) {
        const data = super.get(key);
        if (!data) return undefined;
        if (revive) {
            const original = this.scheduler.get(key);
            if (original) {
                this.scheduler.schedule(key, () => {
                    const data = this.get(key);
                    if (data && this.options.executor) this.options.executor(data);
                    super.delete(key);
                }, original.delay + super.size);
            }
        }
        return data;
    }

    delete(key) {
        this.scheduler.delete(key);
        return super.delete(key);
    }
    
    clear() {
        this.scheduler.flush();
        super.clear();
    }
    
    [Symbol('djsCleanup')]() {
        return () => {
            this.scheduler.timeouts.length = 0;
            this.scheduler.clear();
            this.scheduler.flush();
        };
    }
}

module.exports = { Cheshire, Options };
