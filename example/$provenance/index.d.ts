
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

declare function createContext(
	event: RequestEvent,
	modules: {
		oauth: OAuthModule;
		session: SessionModule<App.Session, App.SessionExtra>;
		routes: RoutesModule;
		checks: ChecksModule;
	}
): Context<App.Session>;


declare function provenance(
	provider: Provider<App.Session>,
	sessionCallback: SessionCallback<App.Session, App.SessionExtra>,
	logging?: boolean,
	options?: Partial<AuthOptions>
): {
	handle: Handle;
	protectRoute: (event: RequestEvent) => Promise<App.Session & App.SessionExtra>;
	options: AuthOptions;
};
 