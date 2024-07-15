import { getFiles } from "./file";

export const getEvents = () =>
	getFiles("./src/events", ["ts", "js"], ["node_modules"], false);
