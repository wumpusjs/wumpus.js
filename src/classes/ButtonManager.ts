import { ButtonBuilder, ButtonInteraction, Locale } from 'discord.js';
import Button from './Button';
import { InferOptions } from '../interfaces/Button';
import { Repository } from 'typeorm';
import ButtonEntity from '../entity/Button';
import { RANDOM_STRING } from '../utils/crypto';
import { getFiles } from '../utils/file';
import { error } from '../utils/logger';
import path from 'path';
import { EntityClassOrSchema, getRepositoryToken } from '../utils/typeorm';
import { packet, resolve, validate } from '../utils/data';
import Wumpus from '../structures/wumpus';
import UncaughtError from '../templates/error';

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
			error('Failed to load buttons');
			process.exit(1);
		}

		for (const file of files.files) {
			const button = require(path.join(
				__dirname,
				'../buttons',
				file
			)).default;

			if (!(button instanceof Button)) {
				error(`${file} is not an instance of Button`);
				continue;
			}

			this.buttons.set(button.identifier, button);
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
		data: Parameters<T['execute']>[1],
		locale?: Locale
	) {
		try {
			const buttonRepo = this.client.repository('ButtonRepository');

			if (!buttonRepo) {
				error('Button repository not found');
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
			console.error(e);
			return null;
		}
	}

	async handle(interaction: ButtonInteraction) {
		try {
			const buttonRepo = this.client.repository('ButtonRepository');

			if (!buttonRepo) {
				error('Button repository not found');
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

			const specified = this.get(button.identifier);

			if (!specified) {
				return;
			}

			const data: InferOptions<
				Required<typeof specified>['fields'],
				Locale
			> = {};

			const promises: Promise<any>[] = [];

			for (const field of specified.fields ?? []) {
				const value = button.data.find((d) =>
					d.startsWith(`${field.name}=`)
				);

				if (!value) {
					continue;
				}

				promises.push(
					Promise.resolve(
						resolve(interaction.client, interaction.guild?.id)[
							field.type
						](value.split('=').slice(1).join('='))
					).then((value) => {
						data[field.name] = value;
					})
				);
			}

			await Promise.all(promises);

			const repositories = new Array<Repository<EntityClassOrSchema>>();

			if (specified.repositories) {
				for (const repository of specified.repositories) {
					const token = getRepositoryToken(repository as any);

					if (typeof token !== 'string') {
						error('Invalid repository token');
						process.exit(1);
					}

					if (!this.client.database.repositories.has(token)) {
						error('Repository not found');
						process.exit(1);
					}

					repositories.push(
						this.client.database.repositories.get(token)!
					);
				}
			}

			await specified.execute(interaction, data, ...repositories);
		} catch (error) {
			console.error(error);

			const handler =
				interaction.replied || interaction.deferred
					? interaction.followUp
					: interaction.reply;

			await handler({
				embeds: [
					UncaughtError.toEmbed(interaction.user, interaction.locale),
				],
				ephemeral: true,
			});
		}
	}
}
