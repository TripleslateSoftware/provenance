declare global {
	namespace App {
		interface SessionExtra {}
		interface Session {
			accessToken: string;
		}

		interface Locals {
			session: (Session & SessionExtra) | null;
		}
	}
}

declare global {
	namespace App {
		type Session = GetSession<typeof provider>;
	}
}

export {};
