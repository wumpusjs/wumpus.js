import { EmbedTemplate, EmbedType } from '../../utils/embed';

const AlreadyRegistered = new EmbedTemplate({
	title: {
		'en-US': 'You have already registered',
		tr: 'Zaten kayıt oldunuz',
	},
	type: EmbedType.Error,
	description: {
		'en-US': "You've already registered. You can't register again.",
		tr: 'Zaten kayıtlısınız. Tekrar kayıt olamazsınız.',
	},
});

export default AlreadyRegistered;
