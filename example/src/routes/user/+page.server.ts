import { redirect } from '@sveltejs/kit';

import { protectRoute } from '@tripleslate/provenance/initiatives';

import { GH_CLIENT_ID } from '$env/static/private';
import { auth } from '$lib/server/auth';

export const load = async (event) => {
	const session = await protectRoute(auth.createContext)(event);

	const response = await event.fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${session.accessToken}`
		}
	});

	if (response.status !== 200) {
		redirect(302, '/logout');
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
