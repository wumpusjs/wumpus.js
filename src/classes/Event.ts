import { Events } from "discord.js";

interface EventOptions {
	once?: boolean;
	event: Events;
	execute: (...args: any[]) => void;
}

export default class Event {
	once: boolean = false;
	event: Events;
	execute: (...args: any[]) => void;

	constructor(options: EventOptions) {
		this.once = Boolean(options.once ?? false);
		this.event = options.event;
		this.execute = options.execute;
	}
}