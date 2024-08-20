import { ClientEvents } from 'discord.js';
import { MiddlewareHandler } from '../interfaces/Middleware';

export default class Middleware<T extends keyof ClientEvents> {
	event: T;
	handler: MiddlewareHandler<T>;

	constructor(event: T, handler: MiddlewareHandler<T>) {
		this.event = event;
		this.handler = handler;
	}
}
