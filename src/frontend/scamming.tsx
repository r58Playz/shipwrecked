import type { Component } from "dreamland/core";

import {
	calculateProgress,
	calculateShells,
	clearCache,
	fetchGallery,
	fetchInfo,
	fetchReviews,
	fetchUserCount,
	getProjectHours,
	getTotalHours,
	userInfo,
	type ProjectFixed,
	type Review,
	type User,
	type UserData,
	type UserWithProjects,
} from "./api";

import { RandomBackground } from "./background";
import { Loading, ProgressBar, UserName } from "./apiComponents";
import { Card } from "../ui/Card";
import {
	usersToMetrics,
	generateUserClusterAnalysis,
	type UserClusterAnalysis,
} from "./clustering";
import { Button } from "../ui/Button";
import { router } from "../main";
import { ForwardIcon } from "../ui/Icon";

type EnhancedProject = {
	project: ProjectFixed;
	user: User;
	reviews?: Review[];
};

function lookupGraham(graham: UserClusterAnalysis, id: string) {
	const cats = graham.clusters;
	const descriptions = {
		whale:
			"high-impact creator with significant hours, multiple projects, and regular shipping",
		shipper:
			"active contributor with balanced engagement and shipping activity",
		newbie: "new or low-activity user with minimal projects and shipping",
	};
	const emojis = {
		whale: "🐳",
		shipper: "📦",
		newbie: "👶",
	};

	for (const _cat in cats) {
		let cat: "whales" | "shippers" | "newbies" = _cat as any;
		if (cats[cat].users.includes(id)) {
			const name: "whale" | "shipper" | "newbie" = cat.slice(
				0,
				cat.length - 1
			) as any;
			return {
				category: name,
				description: descriptions[name],
				emoji: emojis[name],
			};
		}
	}
	return { category: "unknown", description: "#ERROR!", emoji: "❌" };
}

function islandStatus(
	user: UserWithProjects
): "invitation" | "waitlist" | undefined {
	if (
		user.projects.filter((x) => getProjectHours(x) >= 15 && x.shipped).length >=
		4
	) {
		if (!!user.projects.find((x) => x.viral)) return "invitation";
		return "waitlist";
	}
}

export const RealScamming: Component<{
	gallery: EnhancedProject[];
	graham: UserClusterAnalysis;
	scammer: UserWithProjects[];
	self: UserData;
	actualUserCount: number;
}> = function () {
	let viral = use(this.gallery)
		.mapEach((project) => {
			let review = project.reviews?.find((x) =>
				x.comment.includes("Viral: No → Yes")
			);
			return {
				...project,
				viralDate: review ? new Date(review.createdAt) : null,
			};
		})
		.map((x) =>
			x.sort((a, b) => {
				return +(a.viralDate || new Date()) - +(b.viralDate || new Date());
			})
		)
		.map((x) =>
			x.filter(
				(x, i, s) =>
					x.project.viral &&
					i === s.findIndex((y) => x.project.userId === y.project.userId)
			)
		);
	let shipped = use(this.gallery)
		.map((x) =>
			x.sort((a, b) => (a.user.name || "").localeCompare(b.user.name || ""))
		)
		.map((x) =>
			x.filter(
				(x, i, s) =>
					x.project.shipped &&
					i === s.findIndex((y) => x.project.userId === y.project.userId)
			)
		);

	let currentUser = use(this.graham).map((x) => lookupGraham(x, this.self.id));

	return (
		<div>
			<Card title="API Scamming">scamming of the apis</Card>
			<div class="group">
				<Card title="Virality" small={true}>
					<div class="dominant">
						<div>{viral.map((x) => x.length)} people have gone viral:</div>
						<ol>
							{viral.mapEach((x) => (
								<li>
									<UserName user={x.user} /> at{" "}
									{x.viralDate ? x.viralDate.toLocaleString() : "Unknown"}
								</li>
							))}
						</ol>
					</div>
				</Card>
				<Card title="Shipped" small={true}>
					<div class="submissive">
						<div>
							{shipped.map((x) => x.length)} people have shipped projects:
						</div>
						<ul>
							{shipped.mapEach((x) => (
								<li>
									<UserName user={x.user} />
								</li>
							))}
						</ul>
					</div>
				</Card>
			</div>
			<Card title="Whales" small={true}>
				<div>
					Graham's analytics stolen and done on the client. The data is from the
					Gallery endpoint, so it isn't exactly the same as what's on the actual
					analytics admin page
				</div>
				<div>
					You are a {currentUser.map((x) => x.emoji)}! A{" "}
					{currentUser.map((x) => x.category)} (
					{currentUser.map((x) => x.description)}) to be specific.
				</div>
			</Card>
			<div class="group">
				<Card title="Categories" project={true}>
					<div>
						Invitations:{" "}
						{use(this.scammer)
							.mapEach(islandStatus)
							.map((x) => x.filter((x) => x === "invitation").length)}
					</div>
					<div>
						Waitlists:{" "}
						{use(this.scammer)
							.mapEach(islandStatus)
							.map((x) => x.filter((x) => x === "waitlist").length)}
					</div>
					<div>
						Whales: {use(this.graham).map((x) => x.clusters.whales.count)}
					</div>
					<div>
						Shippers: {use(this.graham).map((x) => x.clusters.shippers.count)}
					</div>
					<div>
						Newbies: {use(this.graham).map((x) => x.clusters.newbies.count)}
					</div>
					<div>
						Users with no projects (included in newbies):{" "}
						{use(this.scammer)
							.zip(use(this.actualUserCount))
							.map(([a, b]) => b - a.length)}
					</div>
				</Card>
				<Card title="Stats" project={true}>
					<div>Viral projects: {use(this.gallery).map(x=>x.filter(x=>x.project.viral).length)}</div>
					<div>Shipped projects: {use(this.gallery).map(x=>x.filter(x=>x.project.shipped).length)}</div>
					<div>In review projects: {use(this.gallery).map(x=>x.filter(x=>x.project.in_review).length)}</div>
					<div>Airtable synced projects: {use(this.gallery).map(x=>x.filter(x=>x.project.airtableId).length)}</div>
					<div>Chat enabled projects: {use(this.gallery).map(x=>x.filter(x=>x.project.chat_enabled).length)}</div>
					<div>Badged projects: {use(this.gallery).map(x=>x.filter(x=>x.project.hasRepoBadge).length)}</div>
					<div>"Submitted" projects: {use(this.gallery).map(x=>x.filter(x=>x.project.submitted).length)}</div>
				</Card>
			</div>
			<div class="group">
				<Card title="Everyone" small={true}>
					<div class="card">
						{use(this.scammer)
							.mapEach((x) => ({
								...x,
								graham: lookupGraham(this.graham, x.user.id),
								island: islandStatus(x),
							}))
							.mapEach((x, i) => (
								<div class="scammer">
									<div class="name">
										<div>
											#{i + 1}: <UserName user={x.user as any} />
										</div>
										<div class="chips">
											<span class={x.graham.category}>
												{x.graham.emoji} {x.graham.category}
											</span>
											{x.island ? (
												<span class={x.island}>{x.island}</span>
											) : null}
										</div>
									</div>
									<ProgressBar projects={x.projects} />
									<Button
										on:click={() =>
											router.navigate("/impersonate/" + x.user.id)
										}
									>
										Impersonate
										<ForwardIcon />
									</Button>
								</div>
							))}
					</div>
				</Card>
			</div>
		</div>
	);
};
RealScamming.css = `
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

		margin-bottom: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px currentColor solid;
	}

	.scammer > * {
		flex: 1;
	}
	.scammer .name {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
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
		white-space: nowrap;
	}

	.shipper {
		background-color: #efb10033;
		color: #894b00;
	}
	.whale {
		background-color: #155dfc33;
		color: #155dfc;
	}

	.invitation {
		background-color: #a3004c33;
		color: #a3004c;
	}
	.waitlist {
		background-color: #01663033;
		color: #016630;
	}
`;

export const ApiScamming: Component<
	{},
	{
		enhancedGallery: EnhancedProject[] | null;
		graham: UserClusterAnalysis | null;
		scammer: UserWithProjects[] | null;
		userCount: number;
	},
	{ "on:routeshown": () => void }
> = function () {
	this.enhancedGallery = null;
	this.graham = null;

	use(userInfo.users).listen(async (x) => {
		if (x) {
			let enhanced: EnhancedProject[] = await Promise.all(
				x
					.flatMap((x) => x.projects.map((y) => [y, x.user] as const))
					.map(async ([x, u]) => ({
						project: x,
						user: u,
						reviews: x.viral ? await fetchReviews(x.projectID) : undefined,
					}))
			);
			this.userCount = await fetchUserCount();
			// stupid test project
			this.enhancedGallery = enhanced.filter(
				(x) => x.project.projectID !== "27504540-15dc-4226-ace4-ccc4d394d213"
			);
			this.graham = generateUserClusterAnalysis(
				usersToMetrics(x),
				this.userCount
			);
			this.scammer = x.sort((a, b) => {
				let progress =
					getTotalHours(calculateProgress(b.projects)) -
					getTotalHours(calculateProgress(a.projects));
				let shells = calculateShells(b.projects) - calculateShells(a.projects);
				return progress === 0 ? shells : progress;
			});
			console.log("graham", this.graham);
			console.log("scammer", this.scammer);
		}
	});

	let allData = use(this.enhancedGallery).zip(
		use(this.graham),
		use(this.scammer),
		use(userInfo.data),
		use(this.userCount)
	);

	this["on:routeshown"] = async () => {
		clearCache();
		await fetchInfo();
		await fetchGallery();
	};

	return (
		<div>
			<RandomBackground />
			{allData.map(([gallery, graham, scammer, self, userCount]) =>
				gallery && graham && scammer && self && userCount ? (
					<RealScamming
						gallery={gallery}
						graham={graham}
						self={self}
						scammer={scammer}
						actualUserCount={userCount}
					/>
				) : (
					<Loading />
				)
			)}
		</div>
	);
};
ApiScamming.css = `
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
