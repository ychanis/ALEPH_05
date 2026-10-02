import type {Reading} from './reading';
export function exportCsv(rows:Reading[],mode:'live'|'test'):{filename:string|null;content:string|null;message:string};
