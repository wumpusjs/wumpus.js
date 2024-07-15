import { ChatInputCommandInteraction, Locale } from "discord.js";

type OptionTypes =
	| "ATTACHMENT"
	| "BOOLEAN"
	| "CHANNEL"
	| "INTEGER"
	| "MEMBER"
	| "MENTIONABLE"
	| "NUMBER"
	| "ROLE"
	| "STRING"
	| "USER";

type OptionTypeMap = {
	ATTACHMENT: string;
	BOOLEAN: boolean;
	CHANNEL: string;
	INTEGER: number;
	MEMBER: string;
	MENTIONABLE: string;
	NUMBER: number;
	ROLE: string;
	STRING: string;
	USER: string;
};

type ExtractOptionNames<T extends CommandOption[], L extends Locale> = {
	[K in keyof T]: T[K] extends { name: infer N }
		? L extends keyof N
			? N[L]
			: never
		: never;
}[number];

type DynamicRequirmenets<Required extends Boolean, Type> = Required extends true
	? Type
	: Type | undefined;

type InferOptions<T extends CommandOption[], L extends Locale> = {
	[K in ExtractOptionNames<T, L> extends string
		? ExtractOptionNames<T, L>
		: never]: DynamicRequirmenets<
		T extends { name: { [key in L]?: K }; required: true }[] ? true : false,
		OptionTypeMap[T[number]["type"]]
	>;
};

interface CommandOption {
	type: OptionTypes;
	name: { [key in Locale]?: string };
	description: { [key in Locale]?: string };
	required?: boolean;
}

interface CommandOptions<T extends CommandOption[], L extends Locale> {
	name: { [key in Locale]?: string };
	description: { [key in Locale]?: string };
	options?: T;
	execute: CommandExecutor<InferOptions<T, L>>;
	defaultLocale?: L;
}

type CommandExecutor<T = {}> = (
	interaction: ChatInputCommandInteraction,
	options: T
) => any;

export type {
	CommandExecutor,
	CommandOptions,
	CommandOption,
	InferOptions,
	OptionTypeMap,
};
