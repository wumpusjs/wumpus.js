import chalk from "chalk";

const header = (name: string) => chalk.gray("[") + name + chalk.gray("]");

export const info = (...message: string[]) =>
	console.log(header(chalk.blue("INFO")), chalk.blue(message));

export const warn = (...message: string[]) =>
	console.log(header(chalk.yellow("WARN")), chalk.yellow(message));

export const error = (...message: string[]) =>
	console.log(header(chalk.red("ERROR")), chalk.red(message));
