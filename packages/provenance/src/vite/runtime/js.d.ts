import type { Handle, RequestEvent } from '@sveltejs/kit';
import type {
	Context,
	Provider,
	AuthOptions,
	OAuthModule,
	SessionModule,
	RoutesModule,
	ChecksModule
} from '@tripleslate/provenance';

/**
 * @param sessionCallback use session data (determined by provider) to return extra information to be stored in the session cookie
 * @param getDomain use event data to return a value for the session cookie's domain attributes
 * @param logging whether to log in handle routes (will use setting for \`dev\` if not provided)
 * @param options provide options to configure things like pathnames and cookie names (all fields are optional with sensible defaults)
 */
export type ProvenanceConfig<ProviderSession, AppSession extends ProviderSession> = {
	sessionCallback: (session: ProviderSession) => AppSession;
	getDomain?: (event: RequestEvent) => string | undefined;
	logging?: boolean;
	options?: AuthOptions;
};

declare function createContext<ProviderSession, AppSession extends ProviderSession>(
	event: RequestEvent,
	modules: {
		oauth: OAuthModule;
		session: SessionModule<ProviderSession, AppSession>;
		routes: RoutesModule;
		checks: ChecksModule<{ referrer?: string }>;
	},
	config: {
		logging: boolean;
		sessionCallback: (session: ProviderSession) => AppSession;
		getDomain?: (event: RequestEvent) => string | undefined;
	}
): Context<ProviderSession, App.Session>;

/**
 * @param provider configuration for your OAuth provider ([see](@tripleslate/provenance/providers/index.ts))
 * @param config optional extra configuration options for provenance behaviour
 * @returns an auth object with handle to be used in \`hooks.server.ts\` and \`protectRoute\` to redirect to login from \`+page.server.ts\` load functions if user is not authenticated
 */
export declare function provenance<ProviderSession, AppSession extends ProviderSession>(
	provider: Provider<ProviderSession>,
	config?: ProvenanceConfig<ProviderSession, AppSession>
): {
	handle: Handle;
	options: AuthOptions;
	createContext: (event: RequestEvent) => ReturnType<typeof createContext>;
};

declare global {
	namespace App {
		interface Session {}

		interface Locals {
			session: Session | null;
		}
	}
}

export {};
