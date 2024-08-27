import { ClientEvents } from 'discord.js';
import Wumpus from '../structures/wumpus';

interface EventOptions<Event extends keyof ClientEvents> {
	once?: boolean;
	event: Event;
	execute: (args: ClientEvents[Event], client: Wumpus) => void;
}

export default class Event<Events extends keyof ClientEvents> {
	once: boolean = false;
	event: Events;
	execute: (...args: any[]) => void;

	constructor(options: EventOptions<Events>) {
		this.once = Boolean(options.once ?? false);
		this.event = options.event;
		this.execute = options.execute;
	}
}
