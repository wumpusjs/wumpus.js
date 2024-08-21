import { ClientEvents } from 'discord.js';

type Promised<T extends any> = Promise<T> | T;

export type MiddlewareHandler<T extends keyof ClientEvents> = (
	args: ClientEvents[T],
	next: () => void
) => Promised<any>;
