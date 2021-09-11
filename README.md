# Cheshire

![Cheshire](https://azurlane.netojuu.com/w/images/thumb/2/28/Cheshire.png/702px-Cheshire.png)

> Your maid catgirl cache manager based on [Collections](https://discord.js.org/#/docs/collection/main/general/welcome) and [TLRU](https://www.npmjs.com/package/tlru)

> Supports both TLRU or LRU cache modes

> The ShipGirl Project; ⓒ Azur Lane

### Installation

* For stable release

> npm i github:Deivu/Cheshire#v1.0.0

### Documentation

> https://deivu.github.io/Cheshire/

### What is LRU and TLRU?

> LRU cache behavior can be found in: https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)

> TLRU cache behavior can be found in: https://en.wikipedia.org/wiki/Cache_replacement_policies#Time_aware_least_recently_used_(TLRU)

### Example Usage (Discord.JS V13)
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