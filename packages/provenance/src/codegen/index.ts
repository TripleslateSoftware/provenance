import { ModuleDeclarationKind, Project } from 'ts-morph';

export function addAppTypes() {
	const project = new Project();

	project.addSourceFilesAtPaths('$provenance/**/*.ts');

	const provenanceFile = project.createSourceFile('$provenance/index.ts');

	const module = provenanceFile.addModule({
		name: 'provenance'
	});
	module.setDeclarationKind(ModuleDeclarationKind.Global);

	const appNamespace = module.addModule({
		name: 'App'
	});
	appNamespace.setDeclarationKind(ModuleDeclarationKind.Namespace);

	const sessionInterface = appNamespace.addInterface({
		name: 'Session'
	});

	const sessionExtrasInterface = appNamespace.addInterface({
		name: 'SessionExtras'
	});
	const localsInterface = appNamespace.addInterface({
		name: 'Locals',
		properties: [
			{
				name: 'session',
				type: `(${sessionInterface.getName()} | ${sessionExtrasInterface.getName()}) | null`
			}
		]
	});
}
