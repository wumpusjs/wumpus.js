import { ButtonStyle, Locale } from 'discord.js';
import {
	ButtonExecutor,
	ButtonOption,
	ButtonOptions,
	InferOptions,
} from '../interfaces/Button';
import { EntityClassOrSchema, EntityInstanceType } from '../utils/typeorm';
import { Repository } from 'typeorm';

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
	/* 
	async createButton(
		client: Client & {
			repositories: Map<
				string,
				Repository<EntityInstanceType<R[number]>>
			>;
		},
		data: InferOptions<T, L>,
		locale?: Locale
	): Promise<ButtonBuilder> {
		const button = (
			client.command as CommandManager<any, any, any>
		).repositories.get('ButtonRepository') as Repository<ButtonEntity>;

		const builder = new ButtonBuilder()
			.setCustomId(RANDOM_STRING(16))
			.setLabel(
				this.labels[locale || this.defaultLocale] ||
					this.labels[this.defaultLocale] ||
					'Unnamed Button'
			)
			.setStyle(this.style)
			.setDisabled(false);

		if (this.emoji) builder.setEmoji(this.emoji);

		return builder;
	} */
}
