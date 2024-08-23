import {Locale } from 'discord.js';
import {
	ButtonExecutor,
	ButtonOption,
	ButtonOptions,
	InferOptions,
} from '../interfaces/Button';
import { EntityClassOrSchema, EntityInstanceType } from '../utils/typeorm';
import { Repository } from 'typeorm';
import { ButtonStyle } from '../utils/button';

export default class Button<
	T extends ButtonOption[] = ButtonOption[],
	L extends Locale = Locale.EnglishUS,
	R extends EntityClassOrSchema[] = EntityClassOrSchema[]
> {
	identifier: string;
	labels: { [key in Locale]?: string };
	fields?: T;
	defaultLocale: Locale;
	repositories?: R;
	execute: ButtonExecutor<
		InferOptions<T, L>,
		Repository<EntityInstanceType<R[number]>>[]
	>;
	style: ButtonStyle;
	emoji?: string;

	constructor(options: ButtonOptions<T, L, R>) {
		this.identifier = options.identifier;
		this.labels = options.labels;
		if (options.fields) this.fields = options.fields as T;
		this.defaultLocale = options.defaultLocale || Locale.EnglishUS;
		this.repositories = (options.repositories || []) as R;
		this.execute = options.execute;
		this.style = options.style || ButtonStyle.Primary;
	}
}
