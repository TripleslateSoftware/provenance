import { GH_CLIENT_ID } from '$env/static/private';
import { auth } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	const session = await auth.protectRoute(event);

	const response = await event.fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${session.accessToken}`
		}
	});

	if (response.status !== 200) {
		throw redirect(303, '/logout');
	}

	const { login, html_url, avatar_url } = await response.json();

	return {
		user: {
			username: login,
			url: html_url,
			avatarUrl: avatar_url
		},
		clientId: GH_CLIENT_ID
	};
};
