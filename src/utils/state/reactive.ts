export type DeepReactive<T> = {
	[K in keyof T]: T[K] extends object ? DeepReactive<T[K]> : T[K];
};

export class ReactiveState<T extends Record<string, any>> {
	private _state: DeepReactive<T>;
	private handlers: Record<string, ((value: DeepReactive<T>) => unknown)[]> =
		{};
	private globals: ((value: DeepReactive<T>) => unknown)[] = [];

	constructor(initialState: T) {
		this._state = this.makeReactive(initialState);
	}

	private makeReactive<S extends object>(obj: S): DeepReactive<S> {
		const result: DeepReactive<S> = {} as DeepReactive<S>;
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (typeof obj[key] === 'object' && obj[key] !== null) {
					result[key] = this.makeReactive(obj[key] as object) as any;
				} else {
					Object.defineProperty(result, key, {
						get: () => {
							return obj[key];
						},
						set: (value) => {
							obj[key] = value;
							this.notifyUpdate(key as string, value);
							this.globalHandler(this._state);
						},
						enumerable: true,
						configurable: true,
					});
				}
			}
		}
		return result;
	}

	public addHandler(
		property: string,
		handler: (value: DeepReactive<T>) => unknown
	) {
		if (!this.handlers[property]) {
			this.handlers[property] = [];
		}
		this.handlers[property].push(handler);
	}

	public addGlobalHandler(handler: (value: DeepReactive<T>) => unknown) {
		this.globals.push(handler);
	}

	private globalHandler: (value: DeepReactive<T>) => unknown = (value) => {
		this.globals.forEach((handler) => handler(value));
		return value;
	};

	private notifyUpdate(property: string, value: any) {
		if (this.handlers[property]) {
			this.handlers[property].forEach((handler) => handler(value));
		}
	}

	get state(): DeepReactive<T> {
		return this._state;
	}

	updateState(newState: DeepReactive<T>) {
		this._state;
		this.globalHandler(newState);
	}
}
