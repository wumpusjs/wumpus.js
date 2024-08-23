import User from '../entity/User';

export class UserMetadata {
	datas: { name: string; value: string }[] = [];

	constructor(private user: User) {
		this.user.data.forEach((data) => {
			const [name, ...value] = data.split('=');

			this.datas.push({ name, value: value.join('=') });
		});
	}

	get(field?: string) {
		if (!field) return this.datas;

		return this.datas.find((data) => data.name === field);
	}

	set(field: string, value: string, overwrite = true) {
		const data = this.datas.find((data) => data.name === field);

		if (data) {
			data.value = value;
		} else {
			this.datas.push({ name: field, value });
		}

		if (overwrite) {
			this.user.data = this.toArray();
		}
	}

	toArray() {
		const data: string[] = [];

		this.datas.forEach(({ name, value }) => {
			data.push(`${name}=${value}`);
		});

		return data;
	}
}
