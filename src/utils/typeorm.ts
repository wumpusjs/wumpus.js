import {
	AbstractRepository,
	DataSource,
	DataSourceOptions,
	Repository,
} from 'typeorm';
import { EntitySchema } from 'typeorm';

export type EntityClassOrSchema = Function | EntitySchema;
export type EntityInstanceType<E extends EntityClassOrSchema> = E extends {
	new (...args: any[]): infer U;
}
	? U
	: E extends EntitySchema<infer U>
	? U
	: never;

/* export const InjectRepository = (
	entity: EntityClassOrSchema,
	dataSource: string = 'default'
): ReturnType<typeof Inject> => Inject(getRepositoryToken(entity, dataSource)); */

export function getRepositoryToken(
	entity: EntityClassOrSchema,
	dataSource: DataSource | DataSourceOptions | string = 'default'
): Function | string {
	if (entity === null || entity === undefined) {
		throw new Error('Invalid entity');
	}
	const dataSourcePrefix = getDataSourcePrefix(dataSource);
	if (
		entity instanceof Function &&
		(entity.prototype instanceof Repository ||
			entity.prototype instanceof AbstractRepository)
	) {
		if (!dataSourcePrefix) {
			return entity;
		}

		if (!entity) {
			throw new Error('Invalid entity');
		}

		return `${dataSourcePrefix}${entity.name}`;
	}

	if (entity instanceof EntitySchema) {
		return `${dataSourcePrefix}${
			(entity.options.target || entity.options).name
		}Repository`;
	}
	return `${dataSourcePrefix}${entity.name}Repository`;
}

export function getDataSourcePrefix(
	dataSource: DataSource | DataSourceOptions | string = 'default'
): string {
	if (dataSource === 'default') return '';

	if (typeof dataSource === 'string') return dataSource + '_';

	if (dataSource.name === 'default' || !dataSource.name) return '';

	return dataSource.name + '_';
}

/* export function Inject<T = any>(
	token?: T
): PropertyDecorator & ParameterDecorator {
	return (
		target: object,
		key: string | symbol | undefined,
		index?: number
	) => {
		let type = token || Reflect.getMetadata('design:type', target, key!);
		if (!type && arguments.length === 0) {
			type = Reflect.getMetadata('design:paramtypes', target, key!)?.[
				index!
			];
		}

		if (typeof index !== 'undefined') {
			Reflect.defineMetadata(
				'self:paramtypes',
				[
					...(Reflect.getMetadata('self:paramtypes', target) || []),
					{ index, param: type },
				],
				target
			);
			return;
		}
		Reflect.defineMetadata(
			'self:properties_metadata',
			[
				...(Reflect.getMetadata(
					'self:properties_metadata',
					target.constructor
				) || []),
				{ key, type },
			],
			target.constructor
		);
	};
} */
