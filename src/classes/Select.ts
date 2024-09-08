import { ComponentType, Locale, SelectMenuType } from 'discord.js';
import { EntityClassOrSchema, EntityInstanceType } from '../utils/typeorm';
import { Repository } from 'typeorm';
import {
	InferOptions,
	OptionFactory,
	SelectExecutor,
	SelectField,
	SelectOptions,
	OptionTypes,
} from '../interfaces/Select';

export default class Select<
	I extends ComponentType.StringSelect /* SelectMenuType */ = ComponentType.StringSelect,
	T extends SelectField<OptionTypes, boolean>[] = SelectField<
		OptionTypes,
		boolean
	>[],
	R extends EntityClassOrSchema[] = EntityClassOrSchema[]
> {
	identifier: string;
	placeholder: { [key in Locale]?: string };
	fields?: T;
	repositories?: R;
	options: OptionFactory<I, Repository<R[number]>[]>;
	execute: SelectExecutor<
		InferOptions<T>,
		I,
		Repository<EntityInstanceType<R[number]>>[]
	>;
	type: I;

	constructor(options: SelectOptions<I, T, R>) {
		this.identifier = options.identifier;
		this.placeholder = options.placeholder;
		this.fields = options.fields;
		this.options = options.options;
		this.repositories = (options.repositories ?? []) as R;
		this.execute = options.execute;
		this.type = options.type;
	}
}
