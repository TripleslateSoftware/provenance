// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			sessionUser: SessionUser | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
