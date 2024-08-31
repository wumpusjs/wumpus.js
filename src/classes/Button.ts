import { Locale } from 'discord.js';
import {
	ButtonExecutor,
	ButtonField,
	ButtonOptions,
	InferOptions,
} from '../interfaces/Button';
import { EntityClassOrSchema, EntityInstanceType } from '../utils/typeorm';
import { Repository } from 'typeorm';
import { ButtonStyle } from '../utils/button';

export default class Button<
	T extends ButtonField[] = ButtonField[],
	R extends EntityClassOrSchema[] = EntityClassOrSchema[]
> {
	identifier: string;
	labels: { [key in Locale]?: string };
	fields?: T;
	repositories?: R;
	execute: ButtonExecutor<
		InferOptions<T>,
		Repository<EntityInstanceType<R[number]>>[]
	>;
	style: ButtonStyle;
	emoji?: string;

	constructor(options: ButtonOptions<T, R>) {
		this.identifier = options.identifier;
		this.labels = options.labels;
		if (options.fields) this.fields = options.fields as T;
		this.repositories = (options.repositories || []) as R;
		this.execute = options.execute;
		this.style = options.style || ButtonStyle.Primary;
	}
}
