import { stateProxy, type Component } from "dreamland/core";

import { router } from "../main";
import { Loading } from "./apiComponents";
import { RandomBackground } from "./background";
import { fetchGallery, getProjectHours, userInfo, type Project } from "./api";

import { BackIcon } from "../ui/Icon";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { TextInput } from "../ui/Input";

const GalleryProject: Component<{ project: Project }, { img: HTMLImageElement | string }> = function(cx) {
	cx.css = `
		:global(.Ui-card) {
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
			align-items: center;
			justify-content: center;
		}

		.chips {
			display: flex;
			gap: 0.5rem;
		}

		.chips span, a {
			backdrop-filter: blur(2px);
			border-radius: 1rem;
			padding: 0 0.5rem;
			color: unset;
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

	cx.mount = async () => {
		let img = new Image();
		let promise = new Promise((res, rej) => {
			img.addEventListener("load", res);
			img.addEventListener("error", rej);
		});

		img.classList.add("img");

		if (!this.project.screenshot) {
			this.img = "No screenshot";
			return;
		}

		img.src = this.project.screenshot;

		try {
			await promise;
			this.img = img;
		} catch {
			this.img = "Failed to load";
		}
	};

	return (
		<div>
			<Card title={this.project.name} project={true}>
				<div class="content">
					<div class="chips">
						<span class="blue">{getProjectHours(this.project)}h</span>
						{this.project.viral ? <span class="pink">Viral</span> : null}
						{this.project.shipped ? <span class="green">Shipped</span> : null}
						{this.project.codeUrl ? <a href={this.project.codeUrl} target="_blank">Code</a> : null}
						{this.project.playableUrl ? <a href={this.project.playableUrl} target="_blank">Demo</a> : null}
					</div>
					{use(this.img).map(x => typeof x === "string" ? <div class="img text" src={this.project.screenshot}>{x}</div> : x)}
					{this.project.description}
				</div>
			</Card>
		</div>
	)
}

const RealGallery: Component<{}, {
	projects: { el: HTMLElement, project: Project }[],
	filter: string,
}> = function(cx) {
	cx.css = `
		:scope {
			padding: 2em;
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

		:scope > div > :global(.Ui-card > h1) {
			text-align: center;
		}
	`;

	this.filter = "";

	stateProxy(this, "projects", use(userInfo.gallery).map(x => x || []).mapEach(x => ({ el: <GalleryProject project={x} />, project: x })));

	let projects = use(this.projects).zip(use(this.filter)).map(([arr, filter]) => {
		if (filter)
			arr = arr.filter(x => x.project.name.toLowerCase().includes(filter.toLowerCase()));

		return arr.sort(({ project: a }, { project: b }) => {
			if (a.screenshot && !b.screenshot) return -1;
			if (b.screenshot && !a.screenshot) return 1;
			return a.name.localeCompare(b.name);
		});
	}).mapEach(({ el }) => el);

	return (
		<div>
			<div>
				<Card title="Gallery">
					<TextInput value={use(this.filter).bind()} placeholder="Search" />
				</Card>
			</div>
			<div class="grid">
				{projects}
			</div>
		</div>
	)
}

export const Gallery: Component = function(cx) {
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

	let allData = use(userInfo.data).zip(use(userInfo.gallery));

	cx.mount = async () => {
		await new Promise(r => setTimeout(r, 200));
		await fetchGallery();
	}

	return (
		<div>
			<RandomBackground />
			{allData.map(([a, b]) => !!a && !!b).andThen(<RealGallery />, <Loading />)}
			<div class="logout-container">
				<Button on:click={() => { router.navigate("/dashboard") }}><BackIcon />Back</Button>
			</div>
		</div>
	)
}
