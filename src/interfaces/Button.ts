import {
	ButtonInteraction,
	ButtonStyle,
	Channel,
	GuildMember,
	Locale,
	Role,
	User,
} from 'discord.js';
import { EntityClassOrSchema, EntityInstanceType } from '../utils/typeorm';
import { Repository } from 'typeorm';

export type OptionTypes =
	| 'BOOLEAN'
	| 'CHANNEL'
	| 'INTEGER'
	| 'MEMBER'
	| 'NUMBER'
	| 'ROLE'
	| 'STRING'
	| 'USER';

type OptionTypeMap = {
	BOOLEAN: boolean;
	CHANNEL: Channel;
	INTEGER: number;
	MEMBER: GuildMember;
	NUMBER: number;
	ROLE: Role;
	STRING: string;
	USER: User;
};

type ExtractOptionNames<T extends ButtonOption[], L extends Locale> = {
	[K in keyof T]: T[K] extends { name: infer N }
		? L extends keyof N
			? N[L]
			: never
		: never;
}[number];

export type DynamicRequirmenets<
	Required extends Boolean,
	Type
> = Required extends true ? Type : Type | undefined;

export type InferOptions<T extends ButtonOption[], L extends Locale> = {
	[K in ExtractOptionNames<T, L> extends string
		? ExtractOptionNames<T, L>
		: never]: DynamicRequirmenets<
		T extends { name: { [key in L]?: K }; required: true }[] ? true : false,
		OptionTypeMap[T[number]['type']]
	>;
};

export interface ButtonOption<
	T extends OptionTypes = OptionTypes,
	R extends boolean = false
> {
	type: T;
	name: string;
	value: DynamicRequirmenets<R, OptionTypeMap[T]>;
	required?: R;
}
export type SpecificButtonOption<T extends OptionTypes> = Omit<
	Extract<ButtonOption, { type: T }>,
	'type' | 'name' | 'description' | 'required'
> & {
	[K: string]: any;
};

export interface ButtonOptions<
	T extends ButtonOption[],
	L extends Locale,
	R extends EntityClassOrSchema[]
> {
	identifier: string;
	labels: { [key in Locale]?: string };
	fields?: Omit<T[number], 'value'>[];
	defaultLocale?: L;
	repositories?: R;
	style?: ButtonStyle;
	emoji?: string;
	execute: ButtonExecutor<
		InferOptions<T, L>,
		Repository<EntityInstanceType<R[number]>>[]
	>;
}

export type ButtonExecutor<
	T = {},
	R extends Repository<EntityInstanceType<EntityClassOrSchema>>[] = []
> = (
	interaction: ButtonInteraction,
	options: T,
	...repositories: R
) => Promise<any>;

export type { OptionTypeMap };
