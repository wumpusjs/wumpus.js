import { EmbedTemplate, EmbedType } from '../../utils/embed';

const NotAnAdmin = new EmbedTemplate({
	title: {
		'en-US': 'You are not an admin',
		tr: 'Bir yönetici değilsiniz',
	},
	type: EmbedType.Error,
	description: {
		'en-US': 'You need to be an admin to use this command.',
		tr: 'Bu komutu kullanabilmek için bir yönetici olmalısınız.',
	},
});

export default NotAnAdmin;
