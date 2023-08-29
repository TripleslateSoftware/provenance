// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface SessionExtra {}
		interface Session {
			accessToken: string;
		}

		// interface Error {}
		interface Locals {
			session: (Session & SessionExtra) | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
