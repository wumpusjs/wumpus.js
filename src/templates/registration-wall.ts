import { EmbedTemplate, EmbedType } from '../utils/embed';

const RegistrationWall = new EmbedTemplate({
	title: {
		'en-US': 'Please Accept the Rules Before Registering!',
		tr: 'Lütfen Kayıt Olmadan Önce Kuralları Kabul Edin!',
	},
	type: EmbedType.Info,
	description: {
		'en-US': "Before you can register and access the full features of our community, please take a moment to read through the server rules. We want to ensure a safe and enjoyable environment for everyone!\n\n✅ Once you've read the rules, click the button below to proceed with registration.\n\nThank you for your cooperation!",
		tr: 'Kayıt olmadan ve topluluğumuzun tüm özelliklerine erişmeden önce, lütfen sunucu kurallarını okumak için bir dakikanızı ayırın. Herkes için güvenli ve eğlenceli bir ortam sağlamak istiyoruz!\n\n✅ Kuralları okuduktan sonra, kayıt işlemine devam etmek için aşağıdaki düğmeyi tıklayın.\n\nİşbirliğiniz için teşekkür ederiz!',
	},
});

export default RegistrationWall;
