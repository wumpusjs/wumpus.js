import User from '../entity/User';
import Button from '../entity/Button';
import Permission from '../entity/Permission';
import State from '../entity/State';
import Select from '../entity/Select';

export interface RepositoriesMap {
	UserRepository: User;
	ButtonRepository: Button;
	SelectRepository: Select;
	PermissionRepository: Permission;
	StateRepository: State;
}
