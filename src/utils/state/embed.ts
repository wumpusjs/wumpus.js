import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ChatInputCommandInteraction,
	EmbedBuilder,
	Locale,
	LocaleString,
	Message,
	User,
} from 'discord.js';
import { EmbedTemplate } from '../embed';
import { DeepReactive, ReactiveState } from './reactive';
import Wumpus from '../../structures/wumpus';
import Button from '../../classes/Button';
import State from '../../entity/State';
import { In } from 'typeorm';
import { RANDOM_STRING } from '../crypto';

interface ReactiveEmbedOptions<T extends Record<string, any>> {
	identifier: string;
	// Initial state for the embed
	initialState: DeepReactive<T>;
	// Embed template to render
	embedTemplate: EmbedTemplate;
	// Buttons to render based on the current state
	buttons: (state: DeepReactive<T>) => Button[];
	handleStateUpdate?: (newState: DeepReactive<T>) => void;
}

export default class ReactiveEmbed<T extends Record<string, any>> {
	identifier: string;
	private state: ReactiveState<DeepReactive<T>>;
	private embedTemplate: EmbedTemplate;
	private buttons: (state: DeepReactive<T>) => Button[];
	private handleStateUpdate?: (newState: any) => void;

	private _button_ids: string[] = [];

	constructor(options: ReactiveEmbedOptions<T>) {
		if (!options.initialState?.id) {
			(options.initialState as any).id = RANDOM_STRING(32) as any;
		}

		this.identifier = options.identifier;

		this.state = new ReactiveState(options.initialState);
		this.embedTemplate = options.embedTemplate;
		this.buttons = options.buttons;
		this.handleStateUpdate = options.handleStateUpdate;

		this.state.addGlobalHandler((value) => {
			this.handleStateUpdate?.(value);
		});
	}

	getEmbed(user: User, locale: Locale = Locale.EnglishUS): EmbedBuilder {
		return this.embedTemplate.toEmbed(
			user,
			locale,
			this.state.state as any
		);
	}

	getButtons<T extends boolean>(
		format: T = false as T
	): T extends true ? ActionRowBuilder[] : ButtonBuilder[] {
		return format
			? (this.buttons(this.state.state as any).reduce(
					(acc, button, i) => {
						acc[i % 3] = (
							acc[i % 3] || new ActionRowBuilder()
						).addComponents(button as any);

						return acc;
					},
					[] as ActionRowBuilder[]
			  ) as any)
			: this.buttons(this.state.state as any);
	}

	async handle(
		client: Wumpus,
		interaction: ButtonInteraction,
		state: State,
		buttonIdentifier: string
	) {
		this.state.updateState(state.state as any);

		const button = this.buttons(this.state.state as any).find(
			(b) => b.identifier === buttonIdentifier
		);

		if (!button) return;

		await button.execute(interaction, {}, client);

		if (interaction.message instanceof Message) {
			await interaction.deferUpdate();

			await interaction.message.edit({
				embeds: [this.getEmbed(interaction.user, interaction.locale)],
				components: (
					await this.updateButtons(
						client,
						this.state.state as State,
						interaction.locale
					)
				).reduce((acc, button, i) => {
					acc[i % 3] = (
						acc[i % 3] || new ActionRowBuilder()
					).addComponents(button as any);

					return acc;
				}, [] as ActionRowBuilder[]) as any,
			});
		}
	}

	async updateButtons(
		client: Wumpus,
		state: State,
		locale: Locale = Locale.EnglishUS
	) {
		if (this._button_ids.length) {
			await client.repository('ButtonRepository')?.delete({
				id: In(this._button_ids),
			});
		}

		const buttons = this.buttons(this.state.state as any);

		const result = await client.buttons.createMany(
			buttons.map((button) => ({
				button,
				data: {
					state: state.id,
				},
			})),
			locale,
			true,
			true
		);

		this._button_ids = result.map((r) => r.id);

		return result.map((r) => r.button);
	}

	async send(client: Wumpus, interaction: ChatInputCommandInteraction) {
		if (!client.stator.reactives.has(this.identifier)) {
			client.logger.warn(
				`Reactive ${this.identifier} not found, auto-registering`
			);
			client.stator.reactives.set(this.identifier, this);
		}

		await client.repository('StateRepository')?.insert({
			identifier: this.identifier,
			id: this.state.state.id as string,
			state: this.state.state,
		});

		const message = await interaction.reply({
			embeds: [this.getEmbed(interaction.user, interaction.locale)],
			components: (
				await this.updateButtons(
					client,
					this.state.state as State,
					interaction.locale
				)
			).reduce((acc, button, i) => {
				acc[i % 3] = (
					acc[i % 3] || new ActionRowBuilder()
				).addComponents(button as any);

				return acc;
			}, [] as ActionRowBuilder[]) as any,
		});
	}
}
