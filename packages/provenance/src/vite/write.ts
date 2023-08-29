import { addGlobal } from '../codegen/global';

export const writeGlobal = async (id: string) => {
	// if (!existsSync('./$provenance')) {
	// 	mkdirSync('./$provenance');
	// }
	// if (!existsSync('./$provenance/types')) {
	// 	mkdirSync('./$provenance/types');
	// }
	// await addAppTypes(id);
	return addGlobal();
};
