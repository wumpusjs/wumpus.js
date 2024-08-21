import { ClientEvents } from 'discord.js';
import { MiddlewareHandler } from '../interfaces/Middleware';

export default class Middleware<T extends keyof ClientEvents> {
	event: T;
	handler: MiddlewareHandler<T>;
	once: boolean;

	constructor(
		event: T,
		handler: MiddlewareHandler<T>,
		once: boolean = false
	) {
		this.event = event;
		this.handler = handler;
		this.once = !!once;
	}
}
