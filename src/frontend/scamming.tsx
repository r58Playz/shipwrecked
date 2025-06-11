import type { Component, DLPointer } from "dreamland/core";

import { calculateProgress, calculateShells, clearCache, fetchGallery, fetchInfo, fetchReviews, getTotalHours, userInfo, type MinimalProject, type ProjectGallery, type Review, type UserData } from "./api";

import { RandomBackground } from "./background";
import { Loading, ProgressBar, UserName } from "./apiComponents";
import { Card } from "../ui/Card";
import { galleryToMetrics, generateUserClusterAnalysis, type UserClusterAnalysis } from "./clustering";

type EnhancedGallery = { project: ProjectGallery, reviews?: Review[] };

interface GalleryUser {
	user: {
		id: string,
		name: string | null,
		slack: string | null,
		image: string | null,
	},
	projects: ProjectGallery[],
}

function galleryToUsers(gallery: ProjectGallery[]): GalleryUser[] {
	let map = new Map<string, GalleryUser>();

	for (const project of gallery) {
		const mapMetrics = map.get(project.userId);
		let user: GalleryUser;
		if (mapMetrics) {
			user = mapMetrics;
		} else {
			user = {
				user: {
					id: project.userId,
					...project.user
				},
				projects: []
			};
			map.set(project.userId, user);
		}

		user.projects.push(project);
	}

	return [...map.values()];
}

export const RealScamming: Component<{ gallery: EnhancedGallery[], graham: UserClusterAnalysis, scammer: GalleryUser[], self: UserData }> = function(cx) {
	cx.css = `
		:scope {
			display: flex;
			flex-direction: column;
			align-items: start;
			gap: 0.5rem;
			padding: 1rem;
			overflow: scroll;
		}

		.card {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}
		ul, ol {
			margin: 0;
		}

		.group {
			display: flex;
			gap: 0.5rem;
			align-items: stretch;
			align-self: stretch;
		}
		.group :global(.Ui-card) {
			flex: 1;
		}
		.group .submissive {
			overflow: scroll;
			height: 0;
			min-height: calc(100% - 3.5rem);
		}

		.scammer {
			display: flex;
			gap: 0.5rem;
			align-items: center;

			border-bottom: 1px currentColor solid;
		}

		.scammer > * {
			flex: 1;
		}
	`;

	let viral = use(this.gallery)
		.mapEach(project => {
			let review = project.reviews?.find(x => x.comment.includes("Viral: No → Yes"));
			return { ...project, viralDate: review ? new Date(review.createdAt) : new Date() };
		})
		.map(x => x.sort((a, b) => {
			return +a.viralDate - +b.viralDate;
		}))
		.map(x => x.filter((x, i, s) => x.project.viral && i === s.findIndex(y => x.project.userId === y.project.userId)))
	let shipped = use(this.gallery)
		.map(x => x.sort((a, b) => (a.project.user.name || "").localeCompare(b.project.user.name || "")))
		.map(x => x.filter((x, i, s) => x.project.shipped && i === s.findIndex(y => x.project.userId === y.project.userId)))

	let currentUser = use(this.graham).map(x => {
		const cats = x.clusters;
		const descriptions = {
			whale: 'high-impact creator with significant hours, multiple projects, and regular shipping',
			shipper: 'active contributor with balanced engagement and shipping activity',
			newbie: 'new or low-activity user with minimal projects and shipping'
		};
		const emojis = {
			whale: "🐳",
			shipper: "📦",
			newbie: "👶",
		};

		for (const _cat in cats) {
			let cat: "whales" | "shippers" | "newbies" = _cat as any;
			if (cats[cat].users.includes(this.self.id)) {
				const name: "whale" | "shipper" | "newbie" = cat.slice(0, cat.length - 1) as any;
				return { category: name, description: descriptions[name], emoji: emojis[name] };
			}
		}
		return { category: "unknown", description: "#ERROR!", emoji: "❌" };
	});

	return (
		<div>
			<Card title="API Scamming">
				scamming of the apis
			</Card>
			<div class="group">
				<Card title="Virality" small={true}>
					<div class="dominant">
						<div>
							{viral.map(x => x.length)} people have gone viral:
						</div>
						<ol>
							{viral.mapEach(x => (
								<li><UserName user={x.project.user as any} /> at {x.viralDate.toLocaleString()}</li>
							))}
						</ol>
					</div>
				</Card>
				<Card title="Shipped" small={true}>
					<div class="submissive">
						<div>
							{shipped.map(x => x.length)} people have shipped projects:
						</div>
						<ul>
							{shipped.mapEach(x => (
								<li><UserName user={x.project.user as any} /></li>
							))}
						</ul>
					</div>
				</Card>
			</div>
			<Card title="Whales" small={true}>
				<div>
					Graham's analytics stolen and done on the client.{" "}
					The data is from the Gallery endpoint, so it isn't exactly the same as what's on the actual analytics admin page
				</div>
				<div>
					You are a {currentUser.map(x => x.emoji)}! A {currentUser.map(x => x.category)} ({currentUser.map(x => x.description)}) to be specific.
				</div>
			</Card>
			<div class="group">
				<Card title="Categories" project={true}>
					<div>Whales: {use(this.graham).map(x => x.clusters.whales.count)}</div>
					<div>Shippers: {use(this.graham).map(x => x.clusters.shippers.count)}</div>
					<div>Newbies: {use(this.graham).map(x => x.clusters.newbies.count)}</div>
				</Card>
				<Card title="Stats" project={true}>
					<div>
						More to come...
					</div>
				</Card>
			</div>
			<div class="group">
				<Card title="Everyone" small={true}>
					<div class="card">
						{use(this.scammer).mapEach(x => (
							<div class="scammer">
								<div class="name">
									{x.user.name || "#ERROR!"}
								</div>
								{<ProgressBar projects={x.projects as any as DLPointer<MinimalProject[]>} />}
							</div>
						))}
					</div>
				</Card>
			</div>
		</div>
	)
}

export const ApiScamming: Component<{}, {
	enhancedGallery: EnhancedGallery[] | null,
	graham: UserClusterAnalysis | null,
	scammer: GalleryUser[] | null,
}, { "on:routeshown": () => void }> = function(cx) {
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

	this.enhancedGallery = null;
	this.graham = null;

	use(userInfo.gallery).listen(async x => {
		if (x) {
			let enhanced = await Promise.all(x.map(async x => ({ project: x, reviews: x.viral ? await fetchReviews(x.projectID) : undefined })));
			// stupid test project 
			this.enhancedGallery = enhanced.filter(x => x.project.projectID !== "27504540-15dc-4226-ace4-ccc4d394d213");
			this.graham = generateUserClusterAnalysis(galleryToMetrics(x));
			this.scammer = galleryToUsers(x).sort((a, b) => {
				let progress = getTotalHours(calculateProgress(b.projects)) - getTotalHours(calculateProgress(a.projects));
				let shells = calculateShells(b.projects) - calculateShells(a.projects);
				return progress === 0 ? shells : progress;
			});
			console.log("graham", this.graham);
			console.log("scammer", this.scammer);
		}
	});

	let allData = use(this.enhancedGallery).zip(use(this.graham), use(this.scammer), use(userInfo.data));

	this["on:routeshown"] = async () => {
		clearCache();
		await fetchInfo();
		await fetchGallery();
	}

	return (
		<div>
			<RandomBackground />
			{allData.map(([gallery, graham, scammer, self]) => (
				gallery && graham && scammer && self ? <RealScamming gallery={gallery} graham={graham} self={self} scammer={scammer} /> : <Loading />
			))}
		</div>
	)
}
