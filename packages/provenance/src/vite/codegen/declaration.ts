import dedent from 'dedent';

export const generateDeclaration = () => dedent`
	import type { Handle, RequestEvent } from '@sveltejs/kit';
	import type {
		Context,
		Provider,
		AuthOptions,
		SessionCallback,
		OAuthModule,
		SessionModule,
		RoutesModule,
		ChecksModule
	} from '@tripleslate/provenance';
	
	function createContext(
		event: RequestEvent,
		modules: {
			oauth: OAuthModule;
			session: SessionModule<App.Session, App.SessionExtra>;
			routes: RoutesModule;
			checks: ChecksModule;
		}
	): Context<App.Session>;

	/**
	 * @param {Provider<App.Session>} provider configuration for your OAuth provider ([see](@tripleslate/provenance/providers/index.ts))
	 * @param {SessionCallback<App.Session, App.SessionExtra>} sessionCallback use session data (determined by provider) to return extra information to be stored in the session cookie
	 * @param {boolean | undefined} logging whether to log in handle routes (will use setting for \`dev\` if not provided)
	 * @param {Partial<AuthOptions> | undefined} options provide options to configure things like pathnames and cookie names (all fields are optional with sensible defaults)
	 * @returns an auth object with handle to be used in \`hooks.server.ts\` and \`protectRoute\` to redirect to login from \`+page.server.ts\` load functions if user is not authenticated
	 */
	function provenance(
		provider: Provider<App.Session>,
		sessionCallback: SessionCallback<App.Session, App.SessionExtra>,
		logging?: boolean,
		options?: Partial<AuthOptions>
	): {
		handle: Handle;
		protectRoute: (event: RequestEvent) => Promise<App.Session & App.SessionExtra>;
		options: AuthOptions;
	};

	declare global {
		namespace App {
			interface SessionExtra {}
			interface Session {}

			interface Locals {
				session: (Session & SessionExtra) | null;
			}
		}
	}

	export {};
`;
