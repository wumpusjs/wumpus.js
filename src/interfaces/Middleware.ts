import { ClientEvents, Embed } from 'discord.js';

type Promised<T extends any> = Promise<T> | T;

export type MiddlewareHandler<T extends keyof ClientEvents> = (
	args: ClientEvents[T],
	next: () => void
) => Promised<void | string | Embed>;
