import { ClientEvents, Events } from "discord.js";

interface EventOptions<Event extends keyof ClientEvents> {
	once?: boolean;
	event: Event;
	execute: (...args: ClientEvents[Event]) => void;
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