import {createHash} from 'crypto';

export const SHA256 = (data:string) => createHash('sha256').update(data).digest('hex');