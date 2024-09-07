import { glob } from 'glob';
import nodePath from 'path';

export function getFiles(
	path: string,
	extensions: string[],
	ignore: string[],
	allowDirectories = true
) {
	return new Promise<{
		success: boolean;
		files: string[];
	}>(async (resolve) => {
		if (!nodePath.isAbsolute(path)) {
			path = nodePath.join(
				process.cwd(),
				process.env.DEV_MODE == 'true' ? 'src' : 'dist',
				path
			);
		}

		if (process.env.DEV_MODE !== 'true') {
			// If not in development mode, remove the ts extension
			extensions = extensions.filter((ext) => ext !== 'ts');
		}

		try {
			let dir = `${allowDirectories ? '**/*' : '*'}`;
			dir += '.';
			if (extensions.length === 1) dir += extensions[0];
			else if (extensions.length === 0) dir += '*';
			else dir += `{${extensions.join(',')}}`;

			const files = await glob(dir, {
				ignore,
				cwd: path,
			});
			if (!files) {
				resolve({ success: false, files: [] });
			}

			resolve({ success: true, files });
		} catch (error) {
			resolve({ success: false, files: [] });
		}
	});
}

export function getPath(path: string) {
	if (!nodePath.isAbsolute(path)) {
		return nodePath.join(
			process.cwd(),
			process.env.DEV_MODE == 'true' ? 'src' : 'dist',
			path
		);
	}

	return path;
}
