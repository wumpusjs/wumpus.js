import fs from 'fs';
import path from 'path';
import { getFiles } from '../utils/file';
import { error, info, warn } from '../utils/logger';

interface ITempOptions {
	dir: string;
	values: {
		[key: number]: Map<string, any>;
	};
}

export default class TempManager {
	options: ITempOptions;

	constructor(options?: ITempOptions) {
		this.options = {
			dir: options?.dir || path.join(process.cwd(), '.temp'),
			values: options?.values || {},
		};

		if (!fs.existsSync(this.options.dir)) {
			fs.mkdirSync(this.options.dir);
		}

		if (
			this.options.values === undefined ||
			Object.keys(this.options.values).length !== 10
		) {
			for (let i = 0; i < 10; i++) {
				this.options.values[i] = new Map();
			}
		}
	}

	async load() {
		const result = await getFiles(
			this.options.dir,
			['tmp'],
			['node_modules'],
			true
		);

		if (!result.success) return false;

		const files = result.files;

		for (const file of files) {
			try {
				const filePath = path.join(this.options.dir, file);

				const data = fs.readFileSync(filePath, 'utf-8');
				const json = JSON.parse(data);

				if (
					typeof json !== 'object' ||
					json === null ||
					!Array.isArray(json)
				) {
					error(
						`Invalid temp file: ${file}! Possible corruption, please check/delete the file!`
					);
					process.exit(1);
				}

				for (const [key, value] of json) {
					this.options.values?.[this.hashKey(key)]?.set(key, value);
				}
			} catch (_) {
				warn(`Failed to load temp file: ${file}`);
			}
		}

		info('Temp files loaded successfully!');

		return true;
	}

	get(key: string) {
		return this.options.values?.[this.hashKey(key)]?.get(key);
	}

	set(key: string, value: any, save = true) {
		const hash = this.hashKey(key);
		this.options.values?.[hash]?.set(key, value);

		try {
			if (save) {
				const filePath = path.join(this.options.dir, `${hash}.tmp`);
				const data = JSON.stringify([
					...this.options.values?.[hash]?.entries(),
				]);

				fs.writeFileSync(filePath, data);
			}
		} catch (error) {
			warn(`Failed to save temp file: ${key}`);
			return false;
		}

		return true;
	}

	hashKey(key: string) {
		let sum = 0;

		for (const char of key) {
			sum += char.charCodeAt(0);
		}

		return sum % 10;
	}
}
