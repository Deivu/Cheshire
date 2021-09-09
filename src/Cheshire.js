const { Collection } = require('@discordjs/collection');
const { Scheduler } = require('fun-dispatcher');

/**
 * Extended map with array methods
 * @external Collection
 * @see {@link https://discord.js.org/#/docs/collection/main/class/Collection}
 */
/**
 * Scheduler that runs functions after x amount of time
 * @external Scheduler
 * @see {@link https://github.com/tinovyatkin/fun-dispatcher}
 */

/**
 * Cheshire's options
 * @class Options
 */
class Options {
    /**
     * @param {Object} [options={}] Options for Cheshire to initialize with
     */
    constructor(options = {}) {
        /**
        * The size limit for this cache. Defaults to "Infinity"
        * @type {number}
        */
        this.limit = options.limit || Infinity;
        /**
        * The lifetime for an entry in this cache in ms. Defaults to "12 * 60 * 60 * 1000"
        * @type {number}
        */
        this.lifetime = options.lifetime || 12 * 60 * 60 * 1000;
        /**
        * An executor that will execute on data eviction. Defaults to "null"
        * @type {Function|null}
        */
        this.executor = options.executor || null;
        /**
        * If true, the cache will operate in LRU mode, if false, the cache will operate in TLRU mode. Defaults to "false"
        * @type {boolean}
        */
        this.lru = options.lru || false;
        if (isNaN(this.limit)) throw new Error('Option limit must be a number');
        if (isNaN(this.lifetime)) throw new Error('Option lifetime must be a number');
        if (this.executor && typeof this.executor !== 'function') throw new Error('Option executor must be a function');
    }
}

/**
 * Cheshire, a TLRU / LRU cache extended from @discordjs/collection
 * @class Cheshire
 * @extends {Collection}
 */
class Cheshire extends Collection {
    /**
     * @param {Object} [options={}] Options for Cheshire to initialize with
     */
    constructor(options = {}) {
        super();
        /**
        * Options for Cheshire
        * @type {Options}
        * @private
        */
        Object.defineProperty(this, 'options', { value: new Options(options) });
        /**
        * Scheduler for cache evictions
        * @type {Scheduler}
        * @private
        */
        Object.defineProperty(this, 'scheduler', { value: new Scheduler() });
    }
    /**
     * Sets a data in cache
     * @param {*} key The key for this entry
     * @param {*} value The data for this entry
     * @param {number} [ttu] The time to use (TTU) for this entry in ms. Defaults to Options.lifetime   
     * @memberof Cheshire
     * @returns {Cheshire}
     */
    set(key, value, ttu = this.options.lifetime + this.size) {
        if (this.size > this.options.limit) this.scheduler.runNext();
        this.scheduler.schedule(key, () => {
            const data = this.get(key);
            super.delete(key);
            if (data && this.options.executor) this.options.executor(data);
        }, ttu);
        return super.set(key, value);
    }
    /**
     * Sets a data in cache
     * @param {*} key The key of the entry in cache
     * @param {number} [revive] If you want to override this entry to use TLRU or LRU cache. Defaults to Options.lru
     * @memberof Cheshire
     * @returns {*|undefined}
     */
    get(key, revive = this.options.lru) {
        const data = super.get(key);
        if (!data) return undefined;
        if (revive) {
            const original = this.scheduler.get(key);
            if (original) {
                this.scheduler.schedule(key, () => {
                    const data = this.get(key);
                    super.delete(key);
                    if (data && this.options.executor) this.options.executor(data);
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
