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
