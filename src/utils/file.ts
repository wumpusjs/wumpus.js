import { glob } from "glob";

export function getFiles(path: string, extensions: string[], ignore: string[], allowDirectories = true) {
	return new Promise<{
		success: boolean;
		files: string[];
	}>(async (resolve) => {
		try {
			const files = await glob(`${allowDirectories ? "**/*" : "*"}.{${extensions.join(",")}}`, {
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
