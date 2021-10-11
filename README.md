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
/* 
 * A use case of custom executor, return true if an item must be deleted, or false if an item should be rescheduled for deletion
 * The code below is an example of the usecase of an executor.
 * Some key points points here is:
 *  "key" refers to the key of the item in this instance
 *  "value" refers to the value of the item in this instance
 */
const UserCache = new Cheshire({ 
	lifetime: 3.6e+6, 
	executor: (key, value) => {
		// In this case I don't want to touch my bot user cache, so it would just reschedule itself again
		if (key === value.client.user.id) return false;
		// In this example, I don't want to uncache users / members that is on a voice channel
		const inVoice = value.client.guilds.cache.some(guild => guild.members.cache.some(member => key === member.id && member.voice.channelId));
		if (inVoice) return false;
		// You can also delete other caches in here, example member cache since we know this user isn't on voice
		value.client.guilds.cache.each(guild => guild.members.cache.sweep(member => key === member.id));
		// In this point since we already checked our filters, we can safetly say we want to delete this user
		return true;
	}
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