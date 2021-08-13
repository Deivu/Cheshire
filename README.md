# TlruCollection

> A TLRU Collection cache for Discord.JS v13, Based on https://www.npmjs.com/package/tlru

## Example Usage
```js
const { TlruCollection } = require('tlru-collection');
const client = new Client({
	makeCache: manager => {
		if (manager.name === 'MessageManager') return new TlruCollection({ maxStoreSize: 100, maxAgeMs: 30 * 60000 });
		return new Collection();
	},
});
```