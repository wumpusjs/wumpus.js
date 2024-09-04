import { ButtonInteraction } from 'discord.js';
import Wumpus from '../structures/wumpus';
import State from '../entity/State';
import ReactiveEmbed from '../utils/state/embed';

export default class Stator {
	client: Wumpus;
	reactives: Map<string, ReactiveEmbed<any>> = new Map();

	constructor(client: Wumpus) {
		this.client = client;
	}

	async handle(
		identifier: string,
		interaction: ButtonInteraction,
		state: State,
		buttonIdentifier: string
	) {
		const reactive = this.reactives.get(identifier);
		if (!reactive) return;

		await reactive.handle(
			this.client,
			interaction,
			state,
			buttonIdentifier
		);
	}
}
