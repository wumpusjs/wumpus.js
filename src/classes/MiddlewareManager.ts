import { ClientEvents } from 'discord.js';
import Middleware from './Middleware';
import Wumpus from '../structures/wumpus';

export default class MiddlewareManager {
	client: Wumpus;
	middlewares: Map<keyof ClientEvents, Middleware<any>[]>;

	constructor(client: Wumpus) {
		this.client = client;
		this.middlewares = new Map();
	}

	addMiddleware(middleware: Middleware<any>): this {
		const middlewares = this.middlewares.get(middleware.event) || [];

		if (middlewares.length < 1) {
			this.client.instance.on(middleware.event, (...args: any[]) =>
				this.handleEvent(middleware.event, ...(args as any))
			);
		}
		this.middlewares.set(middleware.event, [...middlewares, middleware]);

		return this;
	}

	handleEvent<T extends keyof ClientEvents>(
		event: T,
		...args: ClientEvents[T]
	): void {
		const middlewares = [...(this.middlewares.get(event) || [])];

		const next = async () => {
			const middleware = middlewares.shift();

			if (!middleware) {
				return;
			}

			const exec = middleware.handler(args, next, this.client);
			const result = await (exec instanceof Promise
				? exec
				: Promise.resolve(exec));

			if (middleware.once) {
				const list = this.middlewares.get(event) || [];
				const index = list.findIndex((m) => m === middleware);

				if (index !== -1) {
					list.splice(index, 1);
					this.middlewares.set(event, list);
				}
			}

			if (result !== undefined) {
				return result;
			}
		};

		next();
	}
}
