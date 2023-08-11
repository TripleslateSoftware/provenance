import type * as jose from 'jose';

export type SessionCallback = (tokens: {
	idToken: jose.JWTPayload;
	accessToken: jose.JWTPayload;
	refreshToken: jose.JWTPayload;
}) => App.SessionExtra;
