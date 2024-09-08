import {
	AnySelectMenuInteraction,
	BaseSelectMenuBuilder,
	ComponentType,
	Locale,
	StringSelectMenuBuilder,
} from 'discord.js';
import { InferOptions } from '../interfaces/Select';
import { Repository } from 'typeorm';
import SelectEntity from '../entity/Select';
import { RANDOM_STRING } from '../utils/crypto';
import { getFiles, getPath } from '../utils/file';
import { EntityClassOrSchema, getRepositoryToken } from '../utils/typeorm';
import { identifyPacket, packet, resolve, validate } from '../utils/data';
import Wumpus from '../structures/wumpus';
import UncaughtError from '../templates/error';
import Select from './Select';

type EnsureString<T> = T extends string ? T : never;

export default class SelectManager {
	client: Wumpus;
	defaultLocale: Locale;
	selects: Map<string, Select> = new Map();

	constructor(client: Wumpus, defaultLocale: Locale) {
		this.client = client;
		this.defaultLocale = defaultLocale;
	}

	async initialize() {
		const files = await getFiles(
			'./selects',
			['ts', 'js'],
			['node_modules']
		);

		if (!files.success) {
			this.client.logger.fatal('Failed to load selects');
			process.exit(1);
		}

		for (const file of files.files) {
			const select = require(getPath(`./selects/${file}`));

			const STRUCTURE: string[] = [];

			if (select.MODIFY_EXISTING_STRUCTURE?.length) {
				for (const identifier of select.MODIFY_EXISTING_STRUCTURE) {
					if (
						typeof identifier === 'string' &&
						(select[identifier] instanceof Select ||
							select.default?.[identifier] instanceof Select)
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
						!(select[identifier] instanceof Select) &&
						!(select.default?.[identifier] instanceof Select)
					) {
						this.client.logger.error(
							`${file} (${identifier}) is not an instance of Select`
						);
						return true;
					}

					return false;
				})
			) {
				continue;
			}

			for (const identifier of STRUCTURE) {
				const slct = select?.[identifier] || select.default[identifier];
				this.selects.set(slct.identifier, slct);
			}
		}
	}

	addSelect(select: Select) {
		if (!(select instanceof Select)) {
			throw new Error('Select is not an instance of Select');
		}

		this.selects.set(select.identifier, select);
	}

	get(identifier: string): Select | undefined {
		return this.selects.get(identifier);
	}

	async create<T extends Select>(
		specified: T,
		// TODO: Infer data field types from specified.fields
		data: Parameters<T['execute']>[1],
		locale?: Locale
	) {
		try {
			const selectRepo = this.client.repository('SelectRepository');

			if (!selectRepo) {
				this.client.logger.fatal('Select repository not found');
				process.exit(1);
			}

			const entity = new SelectEntity();

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

			await selectRepo.save(entity);

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

			if (specified.type === ComponentType.StringSelect) {
				return new StringSelectMenuBuilder()
					.setCustomId(entity.id)
					.setPlaceholder(
						specified.placeholder[locale || this.defaultLocale] ||
							specified.placeholder[this.defaultLocale] ||
							'Unnamed Select'
					)
					.setOptions(
						await specified.options(this.client, ...repositories)
					);
			}

			// TODO: Implement other select types
			if (specified.type === ComponentType.ChannelSelect) {
				throw new Error('ChannelSelect not implemented');
			}

			if (specified.type === ComponentType.MentionableSelect) {
				throw new Error('MentionableSelect not implemented');
			}

			if (specified.type === ComponentType.RoleSelect) {
				throw new Error('RoleSelect not implemented');
			}

			if (specified.type === ComponentType.UserSelect) {
				throw new Error('UserSelect not implemented');
			}

			return null;
		} catch (e) {
			return null;
		}
	}

	async createMany<T extends Select[], C extends boolean>(
		selects: {
			select: T[number];
			data: Parameters<T[number]['execute']>[1];
		}[],
		locale: Locale,
		getCustomId: C = false as C,
		forceData: boolean = false
	): Promise<
		C extends true
			? { select: BaseSelectMenuBuilder<any>; id: string }[]
			: BaseSelectMenuBuilder<any>[]
	> {
		const selectRepo = this.client.repository('SelectRepository');

		if (!selectRepo) {
			this.client.logger.fatal('Select repository not found');
			process.exit(1);
		}

		const entities = new Array<SelectEntity>();

		for (const { select, data } of selects) {
			const entity = new SelectEntity();

			entity.id = RANDOM_STRING(32);
			entity.identifier = select.identifier;
			entity.data = {};

			if (!forceData) {
				for (const field of select.fields ?? []) {
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

		await selectRepo.save(entities);

		return entities.map(async (entity, i) => {
			const specified = selects[i].select;

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

			if (specified.type === ComponentType.StringSelect) {
				const select = new StringSelectMenuBuilder()
					.setCustomId(entity.id)
					.setPlaceholder(
						specified.placeholder[locale || this.defaultLocale] ||
							specified.placeholder[this.defaultLocale] ||
							'Unnamed Select'
					)
					.setOptions(
						await specified.options(this.client, ...repositories)
					);
				return getCustomId ? { select, id: entity.id } : select;
			}

			// TODO: Implement other select types
			if (specified.type === ComponentType.ChannelSelect) {
				throw new Error('ChannelSelect not implemented');
			}

			if (specified.type === ComponentType.MentionableSelect) {
				throw new Error('MentionableSelect not implemented');
			}

			if (specified.type === ComponentType.RoleSelect) {
				throw new Error('RoleSelect not implemented');
			}

			if (specified.type === ComponentType.UserSelect) {
				throw new Error('UserSelect not implemented');
			}
		}) as unknown as C extends true
			? { select: BaseSelectMenuBuilder<any>; id: string }[]
			: BaseSelectMenuBuilder<any>[];
	}

	async handle(interaction: AnySelectMenuInteraction) {
		try {
			const selectRepo = this.client.repository('SelectRepository');

			if (!selectRepo) {
				this.client.logger.fatal('Select repository not found');
				process.exit(1);
			}

			const id = interaction.customId;

			const select = await selectRepo.findOne({
				where: {
					id,
				},
			});

			if (!select) {
				return;
			}

			const specified = this.get(select.identifier);

			if (!specified) {
				return;
			}

			const data: InferOptions<Required<typeof specified>['fields']> = {};

			const promises: Promise<any>[] = [];

			for (const field of specified.fields ?? []) {
				const value = select.data[field.name];

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
				interaction as any,
				data,
				this.client,
				...repositories
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
