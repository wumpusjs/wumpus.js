import { EmbedTemplate, EmbedType } from '../utils/embed';

const UncaughtError = new EmbedTemplate({
	title: {
		'en-US': 'An error occurred',
		tr: 'Bir hata oluştu',
	},
	type: EmbedType.Error,
	description: {
		'en-US':
			'Something went wrong when I tried to carry out this operation. Please try again later.',
		tr: 'Bu işlemi gerçekleştirmeye çalışırken bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.',
	},
});

export default UncaughtError;
