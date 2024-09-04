import { Locale } from 'discord.js';
import Command from '../../classes/Command';
import User from '../../entity/User';
import ReactiveEmbed from '../../utils/state/embed';
import Button from '../../classes/Button';
import { EmbedTemplate, EmbedType } from '../../utils/embed';

export default new Command({
	name: {
		'en-US': 'ping',
		tr: 'ping',
	},
	description: {
		'en-US': 'Pong!',
		tr: 'Pong!',
	},
	options: [
		{
			type: 'USER',
			description: {
				'en-US': 'The user to ping',
				tr: 'Ping atılacak kullanıcı',
			},
			name: {
				'en-US': 'user',
				tr: 'kullanıcı',
			},
			required: true,
		},
	] as const,
	repositories: [User] as const,
	execute: async (interaction, options, injected) => {
		new ReactiveEmbed({
			identifier: 'test-counter',
			buttons: (state) => [
				new Button({
					identifier: 'test-counter-dec',
					execute: async (interaction) => {
						state.count--;
					},
					labels: {
						'en-US': `Decrement (${state.count - 1})`,
						tr: `Azalt (${state.count - 1})`,
					},
				}),
				new Button({
					identifier: 'test-counter-inc',
					execute: async (interaction) => {
						state.count++;
					},
					labels: {
						'en-US': `Increment (${state.count + 1})`,
						tr: `Arttır (${state.count + 1})`,
					},
				}),
			],
			embedTemplate: new EmbedTemplate({
				title: {
					'en-US': 'Test',
					tr: 'Test',
				},
				description: {
					'en-US': 'Test {{count}}',
					tr: 'Test {{count}}',
				},
				type: EmbedType.Info,
			}),
			initialState: {
				count: 0,
			},
		}).send(injected.at(-1), interaction);
	},
	defaultLocale: Locale.EnglishUS,
});
