import { EmbedTemplate, EmbedType } from '../../utils/embed';

const UnauthorizedInteraction = new EmbedTemplate({
	title: {
		'en-US': 'You cannot do that',
		tr: 'Bunu yapamazsınız',
	},
	type: EmbedType.Error,
	description: {
		'en-US': "You cannot use another user's command.",
		tr: 'Başka bir kullanıcının komutunu kullanamazsınız.',
	},
});

export default UnauthorizedInteraction;
