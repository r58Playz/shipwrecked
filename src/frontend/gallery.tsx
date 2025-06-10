import { stateProxy, type Component } from "dreamland/core";

import { router } from "../main";
import { Loading } from "./apiComponents";
import { RandomBackground } from "./background";
import { clearCache, fetchGallery, getProjectHours, upvote, userInfo, type ProjectGallery } from "./api";

import { BackIcon } from "../ui/Icon";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { TextInput } from "../ui/Input";
import { fetch } from "../epoxy";
import { ToggleButton } from "../ui/ToggleButton";

let parser = new DOMParser();

async function fetchTransform(url: URL, callback: (doc: Document) => string): Promise<URL> {
	let html = parser.parseFromString(await fetch(url.toString()).then(r => r.text()), "text/html");

	let src = callback(html);
	let srcUrl = new URL(src);
	srcUrl.search = "";

	return srcUrl;
}

async function fetchDrive(url: URL, set: (str: string) => void, useVideo: () => void): Promise<string> {
	let id: string;
	if (url.pathname.toLowerCase().startsWith("uc")) {
		id = url.searchParams.get("id") || "";
	} else {
		let path = url.pathname.split("/");
		id = path[path.findIndex(x => x === "d") + 1] || "";
	}

	let raw = `https://drive.usercontent.google.com/download?id=${id}`;
	set(raw);
	let res = await fetch(raw)
	let blob = await res.blob();

	if (new URL(res.url).hostname.toLowerCase() === "accounts.google.com") {
		throw `Content is not accessible`;
	} else if (blob.type.startsWith("video")) {
		useVideo();
	} else if (!blob.type.startsWith("image")) {
		throw `Content type "${blob.type}" unsupported`;
	}

	return await new Promise((res, rej) => {
		let reader = new FileReader();

		reader.onload = () => {
			res(reader.result as string);
		};
		reader.onerror = () => {
			rej(reader.error);
		}

		reader.readAsDataURL(blob);
	});
}

async function preprocessScreenshot(urlStr: string, set: (str: string) => void, useVideo: () => void): Promise<string> {
	let url;
	try {
		url = new URL(urlStr);
	} catch {
		throw "Invalid URL";
	}

	if (!["http:", "https:"].includes(url.protocol.toLowerCase()))
		throw `Invalid URL protocol: "${url.protocol}"`;

	try {
		let host = url.host.toLowerCase();
		if (host === "imgur.com")
			url = await fetchTransform(url, x => (x.querySelector("meta[name='twitter:image']") as HTMLMetaElement).content);
		else if (host === "ibb.co")
			url = await fetchTransform(url, x => (x.querySelector(".image-viewer-container img") as HTMLImageElement).src);
		else if (host === "postimg.cc")
			url = await fetchTransform(url, x => (x.querySelector("#main-image") as HTMLImageElement).src);
		else if (host === "github.com" && (!url.search.toLowerCase().includes("raw") || !url.pathname.toLowerCase().includes("raw")))
			url.searchParams.set("raw", "true");
		else if (host === "drive.google.com") {
			return await fetchDrive(url, set, useVideo);
		}
	} catch (err) {
		console.warn("transform failed for", urlStr, err);
		throw `Failed to apply host-specific transform for "${url.host}"${typeof err === "string" ? `: ${err}` : ""}`;
	}

	return url.toString();
}

type ScreenshotEntry = { valid: true, url: string } | { valid: false, error: string };
let screenshotUrlCache = new Map<string, ScreenshotEntry>();

const GalleryProject: Component<{ project: ProjectGallery }, {
	img: HTMLImageElement | HTMLVideoElement | string,
	transformed: string,
	upvoted: boolean,
	upvotes: number
}> = function(cx) {
	cx.css = `
		:scope :global(.Ui-card) {
			height: 100%;
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			flex: 1;
		}

		.img {
			flex: 1;
			width: 100%;

			border: 1px rgb(230, 215, 214) solid;
			border-radius: 0.375rem;
			backdrop-filter: blur(2px);

			object-fit: contain;

			aspect-ratio: 16 / 8;
		}
		
		.img.text {
			padding: 1em;

			display: flex;
			flex-direction: column;
			gap: 0.5em;
			align-items: center;
			justify-content: center;
			text-align: center;
		}

		.chips {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.chips > span, .chips > a {
			backdrop-filter: blur(2px);
			border-radius: 1rem;
			padding: 0 0.5rem;
			color: unset;
			white-space: nowrap;
		}

		.star {
			transform: scale(1.5);
			display: inline-block;
		}
		.upvote {
			cursor: pointer;
		}

		.yellow {
			background-color: #efb10033;
			color: #efb100;
		}
		.blue {
			background-color: #155dfc33;
			color: #155dfc;
		}
		.pink {
			background-color: #a3004c33;
			color: #a3004c;
		}
		.green {
			background-color: #01663033;
			color: #016630;
		}
	`;

	this.img = "Loading";
	this.transformed = this.project.screenshot;
	this.upvoted = this.project.userUpvoted;
	this.upvotes = this.project.upvoteCount;

	cx.mount = async () => {
		if (!this.project.screenshot) {
			this.img = "No screenshot";
			return;
		}

		let isVideo = false;

		let cached = screenshotUrlCache.get(this.project.screenshot);
		if (cached) {
			if (cached.valid) {
				this.transformed = cached.url;
			} else {
				this.img = cached.error;
				return;
			}
		} else {
			let entry: ScreenshotEntry = { valid: false, error: "" };
			try {
				this.transformed = await preprocessScreenshot(this.transformed, x => this.transformed = x, () => isVideo = true);
				entry = { valid: true, url: this.transformed };
			} catch (err) {
				if (typeof err === "string") {
					this.img = err;
					entry = { valid: false, error: err };
				}
			}

			screenshotUrlCache.set(this.project.screenshot, entry);

			if (!entry.valid)
				return;
		}

		let embed = isVideo ? document.createElement("video") : new Image();
		let promise = isVideo ? Promise.resolve() : new Promise((res, rej) => {
			embed.addEventListener("load", res);
			embed.addEventListener("error", rej);
		});

		embed.src = this.transformed;
		embed.classList.add("img");
		if (this.transformed !== this.project.screenshot) {
			console.debug("transformed", this.project.screenshot, "->", this.transformed.startsWith("data") ? "data url" : this.transformed);
			embed.setAttribute("data-transform", this.project.screenshot);
		}

		if (embed instanceof HTMLVideoElement) {
			embed.controls = true;
		}

		try {
			await promise;
			this.img = embed;
		} catch {
			console.warn("failed to load", this.transformed);
			this.img = "Failed to load";
		}
	};

	let toggleUpvote = async () => {
		let res = await upvote(this.project.projectID);
		console.log(this.project.projectID, res);
		this.upvoted = res.upvoted;
		this.upvotes = res.count;
		await fetchGallery();
	}

	return (
		<div>
			<Card title={this.project.name} project={true}>
				<div class="content">
					<div class="chips">
						<span on:click={toggleUpvote} class="upvote" class:yellow={use(this.upvoted)}>{use(this.upvotes)} <span class="star">٭</span></span>
						<span class="blue">{getProjectHours(this.project)}h</span>
						{this.project.viral ? <span class="pink">Viral</span> : null}
						{this.project.shipped ? <span class="green">Shipped</span> : null}
						{this.project.codeUrl ? <a href={this.project.codeUrl} target="_blank">Code</a> : null}
						{this.project.playableUrl ? <a href={this.project.playableUrl} target="_blank">Demo</a> : null}
						<span on:click={() => router.navigate("/reviews/" + this.project.projectID + "/gallery")} class="upvote">Reviews</span>
					</div>
					{use(this.img).map(x => typeof x === "string" ? (
						<div class="img text" data-url={this.project.screenshot} data-transform={this.transformed}>
							{x}
							{this.project.screenshot ? (
								<div class="chips">
									<a class="pink" href={this.project.screenshot} target="_blank">Open screenshot manually</a>
								</div>
							) : null}
							{this.project.screenshot !== this.transformed ? (
								<div class="chips">
									<a class="pink" href={this.transformed} target="_blank">Open transformed screenshot manually</a>
								</div>
							) : null}
						</div>
					) : x)}
					{this.project.description}
				</div>
			</Card>
		</div>
	)
}

const RealGallery: Component<{}, {
	projects: { el: HTMLElement, project: ProjectGallery }[],
	search: string,
	filterViral: boolean,
	filterShipped: boolean,
	sort: "upvotes" | "hours",
}> = function(cx) {
	cx.css = `
		:scope {
			padding: 1em;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1em;

			overflow: scroll;
		}

		.grid {
			align-self: stretch;
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			gap: 1em;
		}

		.filters {
			display: flex;
			gap: 0.5rem;
			align-items: center;
		}

		.filtercard {
			display: flex;
			gap: 0.5rem;
			flex-direction: column;
		}

		.stats {
			text-align: center;
		}

		:scope > div > :global(.Ui-card > h1) {
			text-align: center;
		}

		@media (max-width: 1330px) {
			.grid {
				grid-template-columns: 1fr 1fr;
			}
		}

		@media (max-width: 900px) {
			.grid {
				grid-template-columns: 1fr;
			}
		}
	`;

	this.search = "";
	this.sort = "upvotes" as ("upvotes" | "hours");
	this.filterShipped = false;
	this.filterViral = false;

	stateProxy(this, "projects", use(userInfo.gallery).map(x => x || []).mapEach(x => ({ el: <GalleryProject project={x} />, project: x })));

	let projects = use(this.projects).zip(use(this.search), use(this.sort), use(this.filterViral), use(this.filterShipped)).map(([arr, search, sort, viral, shipped]) => {
		if (search)
			arr = arr.filter(x => x.project.name.toLowerCase().includes(search.toLowerCase()));

		if (viral)
			arr = arr.filter(x => x.project.viral);
		if (shipped)
			arr = arr.filter(x => x.project.shipped);

		return arr.sort(({ project: a }, { project: b }) => {
			if (a.screenshot && !b.screenshot) return -1;
			if (b.screenshot && !a.screenshot) return 1;

			let ret = 0;
			if (sort === "upvotes")
				ret = b.upvoteCount - a.upvoteCount;
			else if (sort === "hours")
				ret = getProjectHours(b) - getProjectHours(a);

			return ret === 0 ? a.name.localeCompare(b.name) : ret;
		});
	}).mapEach(({ el }) => el);

	return (
		<div>
			<div>
				<Card title="Gallery">
					<div class="filtercard">
						<div class="stats">
							{projects.map(x => x.length)} projects shown out of {use(this.projects).map(x => x.length)}
						</div>
						<TextInput value={use(this.search).bind()} placeholder="Search" />
						<div class="filters">
							Filter:
							<ToggleButton value={use(this.filterViral).bind()}>Viral</ToggleButton>
							<ToggleButton value={use(this.filterShipped).bind()}>Shipped</ToggleButton>
						</div>
						<div class="filters">
							Sort:
							<ToggleButton value={use(this.sort).bind().map(x => x === "upvotes", x => x ? "upvotes" : "hours")}>Upvotes</ToggleButton>
							<ToggleButton value={use(this.sort).bind().map(x => x === "hours", x => x ? "hours" : "upvotes")}>Hours</ToggleButton>
						</div>
					</div>
				</Card>
			</div>
			<div class="grid">
				{projects}
			</div>
		</div>
	)
}

export const Gallery: Component<{}, {}, { "on:routeshown": () => void }> = function(cx) {
	cx.css = `
		:scope {
			width: 100%;
			height: 100%;

			display: grid;
			grid-template-areas: "a";
		}

		:scope > :global(*) {
			grid-area: a;
		}

		.logout-container {
			padding: 1em;
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
		}
	`;

	let allData = use(userInfo.gallery);

	this["on:routeshown"] = async () => {
		clearCache();
		await fetchGallery();
	}

	return (
		<div>
			<RandomBackground />
			{allData.andThen(<RealGallery />, <Loading />)}
			<div class="logout-container">
				<Button on:click={() => { router.navigate("/dashboard") }}><BackIcon />Back</Button>
			</div>
		</div>
	)
}
