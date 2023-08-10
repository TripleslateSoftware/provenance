import { login } from './login.js';
import { logout } from './logout.js';
import { redirectUri } from './redirect-uri.js';
import { refresh } from './refresh.js';
import { lastPath } from './last-path.js';
import { locals } from './locals.js';

export const handles = { redirectUri, refresh, lastPath, login, logout, locals };
