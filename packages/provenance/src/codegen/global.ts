// import { ModuleDeclarationKind, Project } from 'ts-morph';

// export const addGlobal = (sessionType, sessionExtraType) => `
export const addGlobal = () => `
	declare global {
		namespace App {
			interface SessionExtra {}
			interface Session {}

			interface Locals {
				session: (Session & SessionExtra) | null
			}
		}
	}
`;

// export async function addAppTypes(id: string) {
// 	const project = new Project();

// 	// project.addSourceFilesAtPaths('$provenance/**/*.ts');

// 	const provenanceFile = project.createSourceFile('$provenance.d.ts');

// 	const module = provenanceFile.addModule({
// 		name: 'provenance'
// 	});
// 	module.setDeclarationKind(ModuleDeclarationKind.Global);

// 	const appNamespace = module.addModule({
// 		name: 'App'
// 	});
// 	appNamespace.setDeclarationKind(ModuleDeclarationKind.Namespace);

// 	const sessionInterface = appNamespace.addInterface({
// 		name: 'Session'
// 	});

// 	sessionInterface.addProperties([
// 		{
// 			name: 'accessToken',
// 			type: 'string'
// 		}
// 	]);

// 	const sessionExtrasInterface = appNamespace.addInterface({
// 		name: 'SessionExtras'
// 	});
// 	const localsInterface = appNamespace.addInterface({
// 		name: 'Locals',
// 		properties: [
// 			{
// 				name: 'session',
// 				type: `(${sessionInterface.getName()} | ${sessionExtrasInterface.getName()}) | null`
// 			}
// 		]
// 	});

// 	console.log('emit');

// 	// await project.emit();
// }
