import { ClientEvents } from 'discord.js';
import Wumpus from '../structures/wumpus';

type Promised<T extends any> = Promise<T> | T;

export type MiddlewareHandler<T extends keyof ClientEvents> = (
	args: ClientEvents[T],
	next: () => void,
	client: Wumpus
) => Promised<any>;
