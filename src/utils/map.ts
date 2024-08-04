export class HashMap {
	buckets: Map<string, {
		key: string,
		value: any
	}[]> = new Map();

	constructor() {
		this.buckets = new Map();

		for (let i = 0; i < 100; i++) {
			this.buckets.set(i.toString(), []);
		}
	}

	_hash(key: string) {
		let hash = 0;
		for (let i = 0; i < key.length; i++) {
			hash += key.charCodeAt(i);
		}
		return hash % 100;
	}

	set(key: string, value: any) {
		const index = this._hash(key).toString();
		const bucket = this.buckets.get(index);

		if (!bucket) {
			return this;
		}

		for (let i = 0; i < bucket.length; i++) {
			if (bucket[i].key === key) {
				bucket[i].value = value;
				this.buckets.set(index, bucket);
				return this;
			}
		}

		bucket.push({ key, value });
		this.buckets.set(index, bucket);

		return this;
	}

	get(key: string) {
		return this.buckets.get(this._hash(key).toString())?.find((item) => item.key === key)?.value;
	}
}