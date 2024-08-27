import { EmbedTemplate, EmbedType } from '../../utils/embed';

const SuccessfullyRegistered = new EmbedTemplate({
	title: {
		'en-US': 'You have successfully registered!',
		tr: 'Başarıyla kayıt oldunuz!',
	},
	type: EmbedType.Success,
	description: {
		'en-US': 'Now you can start using the bot.',
		tr: 'Artık botu kullanmaya başlayabilirsiniz.',
	},
});

export default SuccessfullyRegistered;
