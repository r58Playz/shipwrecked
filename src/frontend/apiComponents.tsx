import type { Component, DLBasePointer, DLBoundPointer, DLPointer } from "dreamland/core";
import { calculateProgress, calculateProjectProgress, calculateShells, getProjectHours, getTotalHours, type HackatimeLink, type MinimalProject, type Project, type ProjectCommon, type UserStatus } from "./api";
import { Card } from "../ui/Card";

import logo from "../sections/logo.svg";
import { Button } from "../ui/Button";
import { ForwardIcon } from "../ui/Icon";
import { router } from "../main";

type UserNameUser = { image: string | null, name: string | null, status?: UserStatus } | null;
export const UserName: Component<{ user: DLBasePointer<UserNameUser> }> = function(cx) {
	cx.css = `
		img {
			width: 1.25em;
			height: 1.25em;
			vertical-align: middle;

			margin-right: 0.25em;

			border: 2px solid white;
			border-radius: 100%;
		}

		.chip {
			background: white;
			padding: 0 0.5em;
			border-radius: 2em;

			margin-left: 0.25em;
			vertical-align: 5%;

			text-transform: uppercase;
			font-size: 0.8em;
		}

		.chip.FraudSuspect {
			background: red;
			color: white;
		}
	`;

	return (
		<span class="Ui-UserName">
			<img src={use(this.user).map(x => x?.image || logo)} />
			{use(this.user).map(x => x?.name || "#ERROR!")}
			{use(this.user).map(x => x?.status).andThen((x: string) => <span class={`chip ${x}`}>{x}</span>)}
		</span>
	)
}

export const Loading: Component = function(cx) {
	cx.css = `
		:scope {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	`;

	return (
		<div>
			<Card title="Loading"></Card>
		</div>
	)
}

export const ProgressBar: Component<{ projects: DLBasePointer<MinimalProject[]> }, {}> = function(cx) {
	cx.css = `
		:scope {
			max-width: 576px;
			width: 100%;

			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.bar {
			align-self: stretch;
			height: 1rem;

			background: #e5e7eb;
			border-radius: 1rem;
			overflow: hidden;

			display: flex;
			align-items: center;
		}

		.bar > * {
			height: 1rem;
		}

		.viral {
			background: #f59e0b;
		}
		.shipped {
			background: #10b981;
		}
		.unshipped {
			background-color: #3b82f6;
			background-size: 30px 30px;
			background-image: linear-gradient(135deg, rgba(255, 255, 255, .2) 25%, transparent 0, transparent 50%, rgba(255, 255, 255, .2) 0, rgba(255, 255, 255, .2) 75%, transparent 0, transparent);
			animation: unshippedAnimation .75s linear infinite;
		}

		b {
			font-size: 1.5rem;
		}

		@keyframes unshippedAnimation {
			0% { background-position: 0 0 }
			100% { background-position: 60px 0 }
		}
	`;

	const progress = use(this.projects).map(x => x ? calculateProgress(x) : { viral: 0, shipped: 0, unshipped: 0 });
	const shells = use(this.projects).map(x => x ? calculateShells(x) : 0);

	return (
		<div>
			<div class="bar">
				<div class="viral" style={progress.map(x => `width: ${x.viral}%`)} />
				<div class="shipped" style={progress.map(x => `width: ${x.shipped}%`)} />
				<div class="unshipped" style={progress.map(x => `width: ${x.unshipped}%`)} />
			</div>
			<b>{progress.map(x => getTotalHours(x).toFixed(0))}% - {shells} 🐚</b>
		</div>
	)
}

type MaybeCommonProject = ProjectCommon | Project;

const ProjectsTable: Component<{ projects: DLPointer<MaybeCommonProject[]>, selectedId: DLBoundPointer<string | null> }> = function(cx) {
	cx.css = `
		:scope {
			width: 100%;
		}

		th {
			text-align: left;
		}

		tr th {
			width: 100%;
		}

		tr td {
			white-space: nowrap;
		}
		thead th:not(:first-child), tr td {
			padding: 0 0.5rem;
		}
	`;

	function mapState(project: MaybeCommonProject): string {
		if ("in_review" in project && project.in_review)
			return "In Review";
		else if (project.viral)
			return "Viral";
		else if (project.shipped)
			return "Shipped";
		else
			return "Unshipped";
	}

	return (
		<table>
			<thead>
				<th>Name</th>
				<th>Hours</th>
				<th>Contribution</th>
				<th>State</th>
			</thead>
			{use(this.projects).map(x => (x || []).sort((a, b) => getProjectHours(b) - getProjectHours(a))).mapEach((x, i) => {
				let contrib = calculateProjectProgress(x);
				return (
					<tr on:click={() => this.selectedId = x.projectID}>
						<th>{x.name}</th>
						<td>{getProjectHours(x).toFixed(0)}h</td>
						<td>{((i < 4 ? getTotalHours(contrib) : 0) / 60 * 100).toFixed(0)}%</td>
						<td>{mapState(x)}</td>
					</tr>
				)
			})}
		</table>
	)
}

const HackatimeTable: Component<{ links: HackatimeLink[] }> = function(cx) {
	cx.css = `
		:scope {
			width: 100%;
		}

		th {
			text-align: left;
		}

		tr th {
			width: 100%;
		}

		tr td, thead th {
			white-space: nowrap;
		}
		thead th:not(:first-child), tr td {
			padding: 0 0.5rem;
		}
	`;

	return (
		<table>
			<thead>
				<th>Project Name</th>
				<th>Hours</th>
				<th>Approved Hours</th>
			</thead>
			{this.links.map(x => (
				<tr>
					<th>{x.hackatimeName}</th>
					<td>{x.rawHours}h</td>
					<td>{x.hoursOverride ? x.hoursOverride + "h" : "None"}</td>
				</tr>
			))}
		</table>
	)
}

const SelectedProject: Component<{ project: MaybeCommonProject, projects: MaybeCommonProject[], user: UserNameUser, "on:close": () => void }> = function(cx) {
	cx.css = `
		:scope, :scope :global(.Ui-card) {
			height: 100%;
		}

		:global(.Ui-card) {
			display: flex;
			flex-direction: column;
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: 1em;
			min-height: 0;

			overflow: scroll;
		}

		.content img {
			width: 100%;
		}

		.headline {
			font-family: ohno-softie-variable, sans-serif;
			line-height: 1.1;
			font-weight: 600;
			font-size: 1.75rem;
		}

		.buttons {
			display: flex;
			gap: 1em;
			flex-wrap: wrap;
		}

		.close-container {
			position: relative;
			z-index: 1;
		}
		.close-container > :global(*) {
			position: absolute;
			top: 2rem;
			right: 1rem;
		}
	`;

	const contributes = this.projects.sort((a, b) => getProjectHours(b) - getProjectHours(a)).findIndex(x => x.projectID === this.project.projectID) < 4;

	let contrib = { viral: 0, shipped: 0, unshipped: 0 };
	if (contributes) contrib = calculateProjectProgress(this.project);

	let contribString = "";

	if (contrib.viral) {
		contribString += `${contrib.viral} viral hours (${(contrib.viral / 60 * 100).toFixed(0)}%)`;
	}

	if (contrib.shipped) {
		if (contribString.length)
			contribString += ", "
		contribString += `${contrib.shipped} shipped hours (${(contrib.shipped / 60 * 100).toFixed(0)}%)`;
	}

	if (contrib.unshipped) {
		if (contribString.length)
			contribString += ", "
		contribString += `${contrib.unshipped} unshipped hours (${(contrib.unshipped / 60 * 100).toFixed(0)}%)`;
	}

	if (!contribString.length)
		contribString = "no hours";

	return (
		<div>
			<div class="close-container">
				<Button on:click={this["on:close"]}>Close</Button>
			</div>
			<Card title={this.project.name} small={true}>
				<div class="content">
					<div>
						<div class="headline">Time</div>
						<div>Contributes {contribString} to <UserName user={use(this.user)} />'s progress.</div>
						<HackatimeTable links={this.project.hackatimeLinks || []} />
					</div>
					<div>
						<div class="headline">Description</div>
						{this.project.screenshot ? <img src={this.project.screenshot} /> : null}
						<div>
							{this.project.description}
						</div>
					</div>
					<div>
						<div class="headline">Stats</div>
						<div><b>Viral:</b> {this.project.viral}</div>
						<div><b>Shipped:</b> {this.project.shipped}</div>
						{"in_review" in this.project ? <div><b>In review:</b> {this.project.in_review}</div> : null}
					</div>
					<div class="buttons">
						{this.project.codeUrl ? <Button on:click={() => window.open(this.project.codeUrl)}>Code<ForwardIcon /></Button> : null}
						{this.project.playableUrl ? <Button on:click={() => window.open(this.project.playableUrl)}>Demo<ForwardIcon /></Button> : null}
						<Button on:click={() => router.navigate("/reviews/" + this.project.projectID + "/dashboard")}>View Reviews<ForwardIcon /></Button>
						{this.project.chat_enabled ?
							<div><Button on:click={() => router.navigate("/chat/" + this.project.projectID + "/dashboard")}>View Chat<ForwardIcon /></Button></div>
							: null}
						{this.project.chat_enabled ?
							<div><Button on:click={() => router.navigate("/chat/" + this.project.projectID + "/dashboard-doxx")}>View Chat (doxx)<ForwardIcon /></Button></div>
							: null}
					</div>
				</div>
			</Card>
		</div>
	)
}

export const DashboardComponent: Component<{
	user: UserNameUser,
	projects: MaybeCommonProject[],
}, {
	selectedId: string | null
}> = function(cx) {
	cx.css = `
		:scope {
			padding: 1rem;

			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;

			min-height: 0;
		}

		.progress :global(.Ui-card) {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.projects {
			align-self: stretch;
			flex: 1;

			display: flex;
			gap: 2rem;

			min-height: 0;
		}

		.projects > :global(*) {
			flex: 1;
		}
	`;

	this.selectedId = null;

	return (
		<div class="dashboard">
			<div class="progress">
				<Card title={<span><UserName user={use(this.user)} />'s Progress</span>} small={true}>
					<ProgressBar projects={use(this.projects) as DLPointer<Project[]>} />
				</Card>
			</div>
			<div class="projects">
				<Card title="Projects" small={true}>
					<ProjectsTable projects={use(this.projects)} selectedId={use(this.selectedId).bind()} />
				</Card>
				{use(this.selectedId).andThen(
					(id: string) => <SelectedProject
						projects={this.projects}
						project={this.projects.find(x => x.projectID === id)!}
						user={this.user}
						on:close={() => this.selectedId = null}
					/>,
					<div />
				)}
			</div>
		</div>
	)
}
