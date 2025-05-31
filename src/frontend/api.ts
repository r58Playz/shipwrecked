import { createState, type Stateful } from "dreamland/core";
import { fetch } from "../epoxy";
import { settings } from "../store";

const TOKEN_COOKIE = "__Secure-next-auth.session-token";
const SHIPWRECKED = "https://shipwrecked.hackclub.com";

export interface UserData {
	id: string,
	hackatimeId: string,

	name: string,
	image: string,

	isAdmin: boolean,
	role: "User" | "Reviewer" | "Admin",

	email: string,
	emailVerified: Date,

	status: "Unknown" | "L1" | "L2" | "FraudSuspect",
}

export interface HackatimeLink {
	id: string;
	hackatimeName: string;
	rawHours: number;
	hoursOverride?: number | null;
}

export interface Project {
	projectID: string
	name: string
	description: string
	codeUrl: string
	playableUrl: string
	screenshot: string
	submitted: boolean
	userId: string
	viral: boolean
	shipped: boolean
	in_review: boolean
	rawHours?: number;
	hoursOverride?: number | null;
	hackatime?: string;
	hackatimeLinks?: HackatimeLink[];
}

export const userInfo: Stateful<{
	data: UserData | null;
	projects: Project[] | null;
}> = createState({
	data: null,
	projects: null,
});

export async function stealToken(email: string): Promise<boolean> {
	try {
		let res = await fetch(email, { redirect: "manual" });
		let headers = (res as any).rawHeaders as any;
		let cookies = Object.fromEntries(headers["set-cookie"].map((x: string) => x.split(";")[0].split("=")));

		console.log("cookies:", cookies);

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

export function deleteToken() {
	settings.token = null;
	userInfo.data = null;
	userInfo.projects = null;
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

	let data = await fetchCookie(`${SHIPWRECKED}/api/auth/session`).then(r => r.json());

	console.log("user info:", data);

	if (data.user) {
		let parsedData = data.user as UserData;
		parsedData.emailVerified = new Date(parsedData.emailVerified);
		userInfo.data = parsedData;

		return true;
	} else {
		deleteToken();
		return false;
	}
}

export async function fetchProjects() {
	let data = await fetchCookie(`${SHIPWRECKED}/api/projects`).then(r => r.json());
	console.log("projects:", data);
	userInfo.projects = data;
}

// stolen and cleaned up from the real shipwrecked
// wow that code really sucked
export function getProjectHours(project: Project): number {
	if (project.hackatimeLinks?.length) {
		return project.hackatimeLinks.reduce((sum, link) => {
			const effectiveHours = link.hoursOverride || (link.rawHours || 0);
			return sum + effectiveHours;
		}, 0);
	}

	return project?.rawHours || 0;
}

export interface ShipwreckedProgress {
	viral: number,
	shipped: number,
	unshipped: number,
}

export function calculateProjectProgress(project: Project): ShipwreckedProgress {
	const hours = getProjectHours(project);

	if (project?.viral) {
		return { viral: 15, shipped: 0, unshipped: 0 };
	} else if (project?.shipped) {
		return { viral: 0, shipped: Math.min(hours, 15), unshipped: 0 };
	} else {
		return { viral: 0, shipped: 0, unshipped: Math.min(hours, 14.75) };
	}
}

export function calculateProgress(projects: Project[]): ShipwreckedProgress {
	let viral = 0;
	let shipped = 0;
	let unshipped = 0;

	for (const project of projects) {
		let progress = calculateProjectProgress(project);
		viral += progress.viral;
		shipped += progress.shipped;
		unshipped += progress.unshipped;
	}

	return {
		viral: (viral / 60) * 100,
		shipped: (shipped / 60) * 100,
		unshipped: (unshipped / 60) * 100,
	};
}
