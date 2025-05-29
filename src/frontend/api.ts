import { fetch } from "../epoxy";
import { settings } from "../store";

const TOKEN_COOKIE = "__Secure-next-auth.session-token";

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
