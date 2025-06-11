import type { Component, DLBoundPointer, DLPointer } from "dreamland/core";

import { RandomBackground } from "./background";
import { calculateProjectProgress, clearCache, deleteToken, fetchInfo, fetchProjects, getProjectHours, getTotalHours, userInfo, type HackatimeLink, type Project } from "./api";
import { Card } from "../ui/Card";
import { Loading, ProgressBar, UserName } from "./apiComponents";
import { Button } from "../ui/Button";
import { BackIcon, ForwardIcon } from "../ui/Icon";
import { router } from "../main";

const ProjectsTable: Component<{ selectedId: DLBoundPointer<string | null> }> = function(cx) {
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

	function mapState(project: Project): string {
		if (project.in_review)
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
			{use(userInfo.projects).map(x => (x || []).sort((a, b) => getProjectHours(b) - getProjectHours(a))).mapEach((x, i) => {
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

const SelectedProject: Component<{ id: string, "on:close": () => void }> = function(cx) {
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

	const project = userInfo.projects!.find(x => x.projectID === this.id)!;
	const contributes = userInfo.projects!.sort((a, b) => getProjectHours(b) - getProjectHours(a)).findIndex(x => x.projectID === this.id) < 4;

	let contrib = { viral: 0, shipped: 0, unshipped: 0 };
	if (contributes) contrib = calculateProjectProgress(project);

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
			<Card title={project.name} small={true}>
				<div class="content">
					<div>
						<div class="headline">Time</div>
						<div>Contributes {contribString} to <UserName user={use(userInfo.data)} />'s progress.</div>
						<HackatimeTable links={project.hackatimeLinks || []} />
					</div>
					<div>
						<div class="headline">Description</div>
						{project.screenshot ? <img src={project.screenshot} /> : null}
						<div>
							{project.description}
						</div>
					</div>
					<div>
						<div class="headline">Stats</div>
						<div><b>Viral:</b> {project.viral}</div>
						<div><b>Shipped:</b> {project.shipped}</div>
						<div><b>In review:</b> {project.in_review}</div>
					</div>
					<div class="buttons">
						<div>{project.codeUrl ? <Button on:click={() => window.open(project.codeUrl)}>Code<ForwardIcon /></Button> : null}</div>
						<div>{project.playableUrl ? <Button on:click={() => window.open(project.playableUrl)}>Demo<ForwardIcon /></Button> : null}</div>
						<div><Button on:click={() => router.navigate("/reviews/" + project.projectID + "/dashboard")}>View Reviews<ForwardIcon /></Button></div>
					</div>
				</div>
			</Card>
		</div>
	)
}

const RealDashboard: Component<{}, {
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
				<Card title={<span><UserName user={use(userInfo.data)} />'s Progress</span>} small={true}>
					<ProgressBar projects={use(userInfo.projects) as DLPointer<Project[]>} />
				</Card>
			</div>
			<div class="projects">
				<Card title="Projects" small={true}>
					<ProjectsTable selectedId={use(this.selectedId).bind()} />
				</Card>
				{use(this.selectedId).andThen((id: string) => <SelectedProject id={id} on:close={() => this.selectedId = null} />, <div />)}
			</div>
		</div>
	)
}

export const Dashboard: Component<{}, {}, { "on:routeshown": () => void }> = function(cx) {
	cx.css = `
		:scope {
			width: 100%;
			height: 100%;

			display: grid;
			grid-template-areas: "a";
		}

		/*
		:scope:has(:global(.Ui-RandomBackground.idx-0)) :global(.dashboard .projects) {
			flex-direction: row-reverse;
		}
		*/

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

	let allData = use(userInfo.data).zip(use(userInfo.projects));

	this["on:routeshown"] = async () => {
		clearCache();
		await fetchInfo();
		await fetchProjects();
	}

	return (
		<div>
			<RandomBackground />
			{allData.map(([a, b]) => !!a && !!b).andThen(<RealDashboard />, <Loading />)}
			<div class="logout-container">
				<Button on:click={() => { deleteToken(); router.navigate("/") }}><BackIcon />Log Out</Button>
				<Button on:click={() => { router.navigate("/gallery") }}>Gallery<ForwardIcon /></Button>
			</div>
		</div>
	)
}
