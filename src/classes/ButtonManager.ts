import { ButtonBuilder, ButtonInteraction, Locale } from 'discord.js';
import Button from './Button';
import { ButtonField, InferOptions } from '../interfaces/Button';
import { Repository } from 'typeorm';
import ButtonEntity from '../entity/Button';
import { RANDOM_STRING } from '../utils/crypto';
import { getFiles } from '../utils/file';
import path from 'path';
import { EntityClassOrSchema, getRepositoryToken } from '../utils/typeorm';
import { identifyPacket, packet, resolve, validate } from '../utils/data';
import Wumpus from '../structures/wumpus';
import UncaughtError from '../templates/error';
import UnauthorizedInteraction from '../templates/error/unauthorized-interaction';

type EnsureString<T> = T extends string ? T : never;

export default class ButtonManager {
	client: Wumpus;
	defaultLocale: Locale;
	buttons: Map<string, Button> = new Map();

	constructor(client: Wumpus, defaultLocale: Locale) {
		this.client = client;
		this.defaultLocale = defaultLocale;
	}

	async initialize() {
		const files = await getFiles(
			'./src/buttons',
			['ts', 'js'],
			['node_modules']
		);

		if (!files.success) {
			this.client.logger.fatal('Failed to load buttons');
			process.exit(1);
		}

		for (const file of files.files) {
			const button = require(path.join(__dirname, '../buttons', file));

			const STRUCTURE: string[] = [];

			if (button.MODIFY_EXISTING_STRUCTURE?.length) {
				for (const identifier of button.MODIFY_EXISTING_STRUCTURE) {
					if (
						typeof identifier === 'string' &&
						(button[identifier] instanceof Button ||
							button.default?.[identifier] instanceof Button)
					) {
						STRUCTURE.push(identifier);
					}
				}
			} else {
				STRUCTURE.push('default');
			}

			if (
				STRUCTURE.some((identifier) => {
					if (
						!(button[identifier] instanceof Button) &&
						!(button.default?.[identifier] instanceof Button)
					) {
						this.client.logger.error(
							`${file} (${identifier}) is not an instance of Button`
						);
						return true;
					}

					return false;
				})
			) {
				continue;
			}

			for (const identifier of STRUCTURE) {
				const btn = button?.[identifier] || button.default[identifier];
				this.buttons.set(btn.identifier, btn);
			}
		}
	}

	addButton(button: Button) {
		if (!(button instanceof Button)) {
			throw new Error('Button is not an instance of Button');
		}

		this.buttons.set(button.identifier, button);
	}

	get(identifier: string): Button | undefined {
		return this.buttons.get(identifier);
	}

	async create<T extends Button>(
		specified: T,
		// TODO: Infer data field types from specified.fields
		data: Parameters<T['execute']>[1],
		locale?: Locale
	) {
		try {
			const buttonRepo = this.client.repository('ButtonRepository');

			if (!buttonRepo) {
				this.client.logger.fatal('Button repository not found');
				process.exit(1);
			}

			const entity = new ButtonEntity();

			entity.id = RANDOM_STRING(32);
			entity.identifier = specified.identifier;
			entity.data = {};

			for (const field of specified.fields ?? []) {
				if (
					!data[field.name] ||
					!validate[field.type](data[field.name])
				) {
					throw new Error(`Invalid field: ${field.name}`);
				}

				entity.data[field.name] = packet[field.type](data[field.name]);
			}

			await buttonRepo.save(entity);

			const button = new ButtonBuilder()
				.setCustomId(entity.id)
				.setLabel(
					specified.labels[locale || this.defaultLocale] ||
						specified.labels[this.defaultLocale] ||
						'Unnamed Button'
				)
				.setStyle(specified.style)
				.setDisabled(false);

			if (specified.emoji) button.setEmoji(specified.emoji);

			return button;
		} catch (e) {
			return null;
		}
	}

	async createMany<T extends Button[], C extends boolean>(
		buttons: {
			button: T[number];
			data: Parameters<T[number]['execute']>[1];
		}[],
		locale: Locale,
		getCustomId: C = false as C,
		forceData: boolean = false
	): Promise<
		C extends true
			? { button: ButtonBuilder; id: string }[]
			: ButtonBuilder[]
	> {
		const buttonRepo = this.client.repository('ButtonRepository');

		if (!buttonRepo) {
			this.client.logger.fatal('Button repository not found');
			process.exit(1);
		}

		const entities = new Array<ButtonEntity>();

		for (const { button, data } of buttons) {
			const entity = new ButtonEntity();

			entity.id = RANDOM_STRING(32);
			entity.identifier = button.identifier;
			entity.data = {};

			if (!forceData) {
				for (const field of button.fields ?? []) {
					if (
						!data[field.name] ||
						!validate[field.type](data[field.name])
					) {
						throw new Error(`Invalid field: ${field.name}`);
					}

					entity.data[field.name] = packet[field.type](
						data[field.name]
					);
				}
			} else {
				for (const [key, value] of Object.entries(data)) {
					if (!value || !validate?.[identifyPacket(value)]?.(value)) {
						throw new Error(`Invalid field: ${key}`);
					}

					entity.data[key] = packet[identifyPacket(value)](value);
				}
			}

			entities.push(entity);
		}

		await buttonRepo.save(entities);

		return entities.map((entity, i) => {
			const specified = buttons[i].button;

			const button = new ButtonBuilder()
				.setCustomId(entity.id)
				.setLabel(
					specified.labels[locale || this.defaultLocale] ||
						specified.labels[this.defaultLocale] ||
						'Unnamed Button'
				)
				.setStyle(specified.style)
				.setDisabled(false);

			if (specified.emoji) button.setEmoji(specified.emoji);

			if (getCustomId) return { button, id: entity.id };
			return button;
		}) as C extends true
			? { button: ButtonBuilder; id: string }[]
			: ButtonBuilder[];
	}

	async handle(interaction: ButtonInteraction) {
		try {
			const buttonRepo = this.client.repository('ButtonRepository');

			if (!buttonRepo) {
				this.client.logger.fatal('Button repository not found');
				process.exit(1);
			}

			const id = interaction.customId;

			const button = await buttonRepo.findOne({
				where: {
					id,
				},
			});

			if (!button) {
				return;
			}

			if (button.data.state) {
				const stateRepo = this.client.repository('StateRepository');

				if (!stateRepo) {
					this.client.logger.fatal('State repository not found');
					process.exit(1);
				}

				const state = await stateRepo.findOne({
					where: {
						id: button.data.state,
					},
				});

				if (!state) {
					return;
				}

				if (
					state.state.user &&
					state.state.user !== interaction.user.id
				) {
					return await interaction.reply({
						embeds: [
							UnauthorizedInteraction.toEmbed(
								interaction.user,
								interaction.locale
							),
						],
						ephemeral: true,
					});
				}

				return await this.client.stator.handle(
					state.identifier,
					interaction,
					state,
					button.identifier
				);
			}

			const specified = this.get(button.identifier);

			if (!specified) {
				return;
			}

			const data: InferOptions<Required<typeof specified>['fields']> = {};

			const promises: Promise<any>[] = [];

			for (const field of specified.fields ?? []) {
				const value = button.data[field.name];

				if (!value) {
					continue;
				}

				promises.push(
					Promise.resolve(
						resolve(interaction.client, interaction.guild?.id)[
							field.type
						](value)
					).then((value) => {
						data[field.name] = value!;
					})
				);
			}

			await Promise.all(promises);

			const repositories = new Array<Repository<EntityClassOrSchema>>();

			if (specified.repositories) {
				for (const repository of specified.repositories) {
					const token = getRepositoryToken(repository as any);

					if (typeof token !== 'string') {
						this.client.logger.error('Invalid repository token');
						process.exit(1);
					}

					if (!this.client.database.repositories.has(token)) {
						this.client.logger.error('Repository not found');
						process.exit(1);
					}

					repositories.push(
						this.client.database.repositories.get(token)!
					);
				}
			}

			await specified.execute(
				interaction,
				data,
				repositories,
				this.client
			);
		} catch (error) {
			console.error(error);

			if (!interaction) return;

			const handler =
				interaction.replied || interaction?.deferred
					? interaction.followUp
					: interaction.reply;

			await handler?.({
				embeds: [
					UncaughtError.toEmbed(interaction.user, interaction.locale),
				],
				ephemeral: true,
			});
		}
	}
}
