import {
	Locale,
	LocaleString,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandRoleOption,
	SlashCommandUserOption,
	SlashCommandNumberOption,
	SlashCommandBooleanOption,
	SlashCommandChannelOption,
	SlashCommandIntegerOption,
	SlashCommandAttachmentOption,
	SlashCommandMentionableOption,
} from 'discord.js';
import {
	CommandExecutor,
	CommandOption,
	CommandOptions,
	GlobalCommandOptions,
	InferOptions,
	OptionBuilder,
	OptionTypes,
	SpecificCommandOption,
} from '../interfaces/Command';
import { error } from '../utils/logger';
import { Repository } from 'typeorm';
import { EntityClassOrSchema } from '../utils/typeorm';

export default class Command<
	T extends CommandOption[],
	L extends Locale,
	R extends EntityClassOrSchema[]
> {
	name: Map<Locale, string> = new Map();
	description: Map<Locale, string> = new Map();
	execute: CommandExecutor<InferOptions<T, L>, Repository<R[number]>[]>;
	defaultLocale: LocaleString;
	options: InferOptions<T, L>;
	timeout = -1;
	repositories?: R;

	constructor(options: CommandOptions<T, L, R>) {
		if (options.name) {
			for (const [locale, name] of Object.entries(options.name)) {
				this.addName(locale as Locale, name);
			}
		}

		if (options.description) {
			for (const [locale, description] of Object.entries(
				options.description
			)) {
				this.addDescription(locale as Locale, description);
			}
		}

		this.execute = options.execute as any;
		this.defaultLocale = options.defaultLocale || 'en-US';
		this.options = options.options as InferOptions<T, L>;
		this.timeout = Math.max(Math.trunc(Number(options.timeout)), -1) ?? -1;

		if (options.repositories) {
			this.repositories = options.repositories;
		}
	}

	addName(locale: Locale, name: string): this {
		this.name.set(locale, String(name));
		return this;
	}

	addDescription(locale: Locale, description: string): this {
		this.description.set(locale, String(description));
		return this;
	}

	removeName(locale: Locale): this {
		this.name.delete(locale);
		return this;
	}

	removeDescription(locale: Locale): this {
		this.description.delete(locale);
		return this;
	}

	getName(locale?: Locale): string | undefined {
		return (
			(locale ? this.name.get(locale) : undefined) ||
			this.name.get(this.defaultLocale as Locale)
		);
	}

	getDescription(locale?: Locale): string | undefined {
		return (
			(locale ? this.description.get(locale) : undefined) ||
			this.description.get(this.defaultLocale as Locale)
		);
	}

	toSlashCommand(locale?: Locale): SlashCommandBuilder {
		const command = new SlashCommandBuilder()
			.setName(this.getName(locale) || this.name.values().next().value!)
			.setDescription(
				this.getDescription(locale) ||
					this.description.values().next().value!
			);

		for (const option of (this.options ?? []) as (Omit<CommandOption, 'type'> & {
			type: OptionTypes;
		})[]) {
			const [identifier, data] = Object.entries(option).reduce(
				(acc, [key, value]) => {
					acc[
						+!['type', 'name', 'description', 'required'].includes(
							key
						)
					][key] = value;
					return acc;
				},
				[{}, {}] as {
					[K: string]: any;
				}[]
			) as [GlobalCommandOptions, SpecificCommandOption<OptionTypes>];

			switch (option.type) {
				case 'STRING':
					command.addStringOption(
						this.buildOption<'STRING'>(
							locale!,
							option.type,
							identifier,
							data
						)
					);
					break;
				case 'BOOLEAN':
					command.addBooleanOption(
						this.buildOption<'BOOLEAN'>(
							locale!,
							option.type,
							identifier,
							data
						)
					);
					break;
				case 'CHANNEL':
					command.addChannelOption(
						this.buildOption<'CHANNEL'>(
							locale!,
							option.type,
							identifier,
							data
						)
					);
					break;
				case 'INTEGER':
					command.addIntegerOption(
						this.buildOption<'INTEGER'>(
							locale!,
							option.type,
							identifier,
							data
						)
					);
					break;
				case 'NUMBER':
					command.addNumberOption(
						this.buildOption<'NUMBER'>(
							locale!,
							option.type,
							identifier,
							data
						)
					);
					break;
				case 'ROLE':
					command.addRoleOption(
						this.buildOption<'ROLE'>(
							locale!,
							option.type,
							identifier,
							data
						)
					);
					break;
				case 'USER':
					command.addUserOption(
						this.buildOption<'USER'>(
							locale!,
							option.type,
							identifier,
							data
						)
					);
					break;
				case 'ATTACHMENT':
					command.addAttachmentOption(
						this.buildOption<'ATTACHMENT'>(
							locale!,
							option.type,
							identifier,
							data
						)
					);
					break;
				case 'MENTIONABLE':
					command.addMentionableOption(
						this.buildOption<'MENTIONABLE'>(
							locale!,
							option.type,
							identifier,
							data
						)
					);
					break;
				default:
					error(`Invalid option type: ${option.type}`);
					process.exit(1);
			}
		}

		return command;
	}

	buildOption<T extends OptionTypes>(
		locale: Locale,
		type: T,
		identifier: GlobalCommandOptions,
		data: SpecificCommandOption<T>
	): OptionBuilder<T> {
		const option = (
			{
				STRING: () => new SlashCommandStringOption(),
				BOOLEAN: () => new SlashCommandBooleanOption(),
				CHANNEL: () => new SlashCommandChannelOption(),
				INTEGER: () => new SlashCommandIntegerOption(),
				NUMBER: () => new SlashCommandNumberOption(),
				ROLE: () => new SlashCommandRoleOption(),
				USER: () => new SlashCommandUserOption(),
				ATTACHMENT: () => new SlashCommandAttachmentOption(),
				MENTIONABLE: () => new SlashCommandMentionableOption(),
			} as {
				[K in OptionTypes]: () => OptionBuilder<K>;
			}
		)?.[type]?.();

		if (!option) {
			error(`Invalid option type: ${type}`);
			process.exit(1);
		}

		option.setName(
			identifier.name[locale] ||
				identifier.name[this.defaultLocale as Locale]!
		);
		option.setDescription(
			identifier.description[locale] ||
				identifier.description[this.defaultLocale as Locale]!
		);
		option.setRequired(!!identifier.required);

		option.setNameLocalizations(identifier.name);
		option.setDescriptionLocalizations(identifier.description);

		for (const [key, value] of Object.entries(data)) {
			if (value) {
				option[key as keyof typeof option] = value;
			}
		}

		return option;
	}
}
