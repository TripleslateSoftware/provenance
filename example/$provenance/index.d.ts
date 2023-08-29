import type { Handle, RequestEvent } from '@sveltejs/kit';
import type {
	Context,
	Provider,
	SessionCallback,
	AuthOptions,
	OAuthModule
} from '@tripleslate/provenance';

declare function createContext(
	event: RequestEvent,
	modules: {
		oauth: OAuthModule;
	}
): Context<App.Session>;

/**
 * create an auth object that provides a handle hook and a function to protect routes
 *
 * `src/lib/auth.ts`
 * ```ts title="$lib/auth.ts"
 * import { provenance } from '$provenance';
 * import { github } from '@tripleslate/provenance/providers';
 *
 * import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';
 *
 * export const auth = provenance(
 * 	github({ clientId: GH_CLIENT_ID, clientSecret: GH_CLIENT_SECRET }),
 * 	() => {
 *    return {}
 *	}
 * );
 * ```
 *
 * `src/hooks.server.ts`
 * ```ts title="hooks.server.ts"
 * import { auth } from '$lib/auth.js';
 *
 * export const handle = auth.handle;
 * ```
 *
 * `handle` will programmatically create 3 routes:
 * - `redirectUri` to handle redirects from the auth server as part of the oauth authorization flow
 * - `login` to redirect the user to the proper oauth url when navigated
 * - `logout` to destroy the oauth and cookie session when navigated
 *
 * other handle functionality will manage session cookies, provide session in locals, refresh the access token,
 * and keep track of the last path to which the user navigated (for redirecting back to protected routes after authenticating)
 *
 * `protectRoute` can be awaited in `+page.server.ts` load functions to send the user to the login route if a session is required
 *
 * @param {Provider<App.Session>} provider configuration for your OAuth provider ([see](@tripleslate/provenance/providers/index.ts))
 * @param {(session: App.Session) => App.SessionExtra} sessionCallback use session data (determined by provider) to return extra information to be stored in the session cookie
 * @param {boolean | undefined} logging whether to log in handle routes (will use setting for `dev` if not provided)
 * @param {Partial<AuthOptions> | undefined} options provide options to configure things like pathnames and cookie names (all fields are optional with sensible defaults)
 * @returns an auth object with handle to be used in `hooks.server.ts` and `protectRoute` to redirect to login from `+page.server.ts` load functions if user is not authenticated
 */
declare function provenance(
	provider: Provider<App.Session, App.SessionExtra>,
	sessionCallback: (session: App.Session) => App.SessionExtra,
	logging?: boolean,
	options?: Partial<AuthOptions>
): {
	handle: Handle;
	protectRoute: (event: RequestEvent) => Promise<App.Session & App.SessionExtra>;
	options: AuthOptions;
};
