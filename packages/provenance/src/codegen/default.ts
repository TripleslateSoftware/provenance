import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";

import { c } from "@tripleslate/provenance/checks";
import { o } from "@tripleslate/provenance/oauth";
import { s } from "@tripleslate/provenance/session";
import { h } from "@tripleslate/provenance/handles";
import { l } from "@tripleslate/provenance/load";

const defaultedOptions = {
    redirectUriPathname: '/auth',
    sessionCookieName: 'session',
    loginPathname: '/login',
    logoutPathname: '/logout',
    lastPathCookieName: 'last-path',
};

const defaultedLogging = ${logging} || dev;

const checks = c();
const oauth = o({ checks }, provider);
const session = s(provider, dev, sessionCallback);
const handles = h({ checks, oauth, session }, redirect, defaultedLogging, defaultedOptions);

const loadUtils = l(redirect, {
    loginPathname: defaultedOptions.loginPathname
});

export default {
    handle: handles.handle,
    protectRoute: loadUtils.protectRoute,
    options: defaultedOptions
};