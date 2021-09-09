import { Collection } from '@discordjs/collection';
import { Scheduler } from 'fun-dispatcher';

export interface Options {
    limit?: number,
    lifetime?: number,
    executor?: (V: any) => void,
    lru?: boolean
}

export class Cheshire<K, V> extends Collection<K, V> {
    constructor(options: Options);
    private options: Options;
    private scheduler: Scheduler;
    public set(key: K, value: V, ttu?: number): this;
    public get(key: K, revive?: boolean): V;
}