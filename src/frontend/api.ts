import { createState, type Stateful } from "dreamland/core";
import { fetch } from "../epoxy";
import { settings } from "../store";

const TOKEN_COOKIE = "__Secure-next-auth.session-token";
const SHIPWRECKED = "https://shipwrecked.hackclub.com";

export interface UserData {
	email: string,
	emailVerified: Date,
	hackatimeId: string,
	id: string,
	image: string,
	isAdmin: boolean,
	name: string,
	slack: string,
	status: "Unknown" | "L1" | "L2" | "FraudSuspect",
}

export const userInfo: Stateful<{
	data: UserData | null;
}> = createState({
	data: null
});

export async function stealToken(email: string): Promise<boolean> {
	try {
		let res = await fetch(email, { redirect: "manual" });
		let headers = (res as any).rawHeaders as any;
		let cookies = Object.fromEntries(headers["set-cookie"].map((x: string) => x.split(";")[0].split("=")));

		console.log(cookies);

		if (cookies[TOKEN_COOKIE]) {
			settings.token = cookies[TOKEN_COOKIE];
			return true;
		} else {
			return false;
		}
	} catch (err) {
		console.error(err);
		return false;
	}
}

export async function fetchCookie(url: string, options?: any): Promise<Response> {
	options ||= {};
	options.headers ||= {};
	options.headers["cookie"] ||= [];
	options.headers["cookie"].push(`${TOKEN_COOKIE}=${settings.token}`);

	return await fetch(url, options);
}

export async function fetchInfo(): Promise<boolean> {
	if (!settings.token) return false;

	let data = await fetchCookie(`${SHIPWRECKED}/api/users/me`).then(r => r.json());

	console.log("user info:", data);

	if (!data.error) {
		data.emailVerified = new Date(data.emailVerified);
		let parsedData = data as UserData;
		userInfo.data = parsedData;

		return true;
	} else {
		settings.token = null;
		return false;
	}
}
