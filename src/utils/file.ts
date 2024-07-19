import { glob } from "glob";

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
		try {
			let dir = `${allowDirectories ? "**/*" : "*"}`;
			dir += ".";
			if (extensions.length === 1) dir += extensions[0];
			else if (extensions.length === 0) dir += "*";
			else dir += `{${extensions.join(",")}}`;

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
