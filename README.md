# Cheshire

![Cheshire](https://azurlane.netojuu.com/w/images/thumb/2/28/Cheshire.png/702px-Cheshire.png)

> Your maid catgirl cache manager based on [Collections](https://discord.js.org/#/docs/collection/main/general/welcome) and [TLRU](https://www.npmjs.com/package/tlru)

> Supports both TLRU or LRU 

> The ShipGirl Project; ⓒ Azur Lane

## Documentation

> 
### Default options explained
```js
const { Cheshire } = require('cheshire');
// Default options
const cache = new Cheshire({
	limit: Infinity, // Max size limit for this cache
    lifetime: 12 * 60 * 60 * 1000, // How long data should be stored in ms
    executor: null, // Additional thing you want to execute once the "expired" will be sweeped
    lru: false, // If false, the cache will behave in "LRU" mode. If true, the will execute in "TLRU" mode
})
```
> LRU cache behavior can be found in: https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)

> TLRU cache behavior can be found in: https://en.wikipedia.org/wiki/Cache_replacement_policies#Time_aware_least_recently_used_(TLRU)

### Modified methods
> cache.set()
```js
// First Parameter is the key for this value in cache
// Second Parameter is the value for this key in cache
// Third Parameter is optional, sets how long this data in cahe should live in ms, Overrides option.lifetime 
cache.set(key: K, value: V, ttu?: number): Cheshire;
```
> cache.get()
```js
// First Parameter is the key you want to get in your cache
// Second Parameter is optional, extends the expiry of this data in cache, Overrides option.lru
cache.get(key: K, revive?: boolean): V;
```
> As this extends Collection, Other methods can be found at [Discord.JS Collection Docs](https://discord.js.org/#/docs/collection/main/class/Collection)

## Example Usage
```js
const { Collection } = require('@discordjs/collection');
const { Cheshire } = require('cheshire');

const MessageCache = new Cheshire({ 
	limit: 100, 
	lifetime: 1.8e+6 
});
const UserCache = new Cheshire({ 
	lifetime: 3.6e+6, 
	executor: user => user.client.guilds.cache.each(guild => guild.members.cache.delete(user.id)) 
});

// Client is your Discord.JS client
const client = new Client({
	makeCache: manager => {
		if (manager.name === 'MessageManager') return MessageCache;
		else if (manager.name === 'UserManager') return UserCache;
		else return new Collection();
	},
});
```