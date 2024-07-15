import { Locale, LocaleString, SlashCommandBuilder } from "discord.js";
import {
	CommandExecutor,
	CommandOption,
	CommandOptions,
	InferOptions,
} from "../interfaces/Command";

export default class Command<T extends CommandOption[], L extends Locale> {
	name: Map<Locale, string> = new Map();
	description: Map<Locale, string> = new Map();
	execute: CommandExecutor<InferOptions<T, L>>;
	defaultLocale: LocaleString;
	options: InferOptions<T, L>;

	constructor(options: CommandOptions<T, L>) {
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

		this.execute = options.execute;
		this.defaultLocale = options.defaultLocale || "en-US";
		this.options = options.options as InferOptions<T, L>;
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
		return new SlashCommandBuilder()
			.setName(this.getName(locale) || this.name.values().next().value)
			.setDescription(
				this.getDescription(locale) ||
					this.description.values().next().value
			);
	}
}
