import type { Component } from "dreamland/core";

import { RandomBackground } from "./background";
import { calculateProgress, fetchProjects, getProjectHours, userInfo, type Project } from "./api";
import { Card } from "../ui/Card";
import { UserName } from "./apiComponents";

const ProgressBar: Component<{}, {}> = function(cx) {
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
			animation: unshippedAnimation .5s linear infinite;
		}

		b {
			font-size: 1.5rem;
		}

		@keyframes unshippedAnimation {
			0% { background-position: 0 0 }
			100% { background-position: 60px 0 }
		}
	`;

	const progress = use(userInfo.projects).map(x => x ? calculateProgress(x) : { viral: 0, shipped: 0, unshipped: 0 });

	return (
		<div>
			<div class="bar">
				<div class="viral" style={progress.map(x => `width: ${x.viral}%`)} />
				<div class="shipped" style={progress.map(x => `width: ${x.shipped}%`)} />
				<div class="unshipped" style={progress.map(x => `width: ${x.unshipped}%`)} />
			</div>
			<b>{progress.map(x => (x.viral + x.unshipped + x.shipped).toFixed(0))}%</b>
		</div>
	)
}

const ProjectsTable: Component = function(cx) {
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
				<th>State</th>
			</thead>
			{use(userInfo.projects).map(x => (x || []).sort((a, b) => getProjectHours(b) - getProjectHours(a))).mapEach(x => (
				<tr>
					<th>{x.name}</th>
					<td>{getProjectHours(x).toFixed(0)}h</td>
					<td>{mapState(x)}</td>
				</tr>
			))}
		</table>
	)
}

const RealDashboard: Component = function(cx) {
	cx.css = `
		:scope {
			padding: 1rem;

			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;
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
		}

		.projects > :global(*) {
			flex: 1;
		}
	`;

	cx.mount = async () => {
		await new Promise(r => setTimeout(r, 100));
		await fetchProjects();
	}

	return (
		<div class="dashboard">
			<div class="progress">
				<Card title={<span><UserName />'s Progress</span>} small={true}>
					<ProgressBar />
				</Card>
			</div>
			<div class="projects">
				<Card title="Projects" small={true}>
					<ProjectsTable />
				</Card>
				<div />
			</div>
		</div>
	)
}

const Loading: Component = function(cx) {
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

export const Dashboard: Component = function(cx) {
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
	`;

	let allData = use(userInfo.data).zip(use(userInfo.projects));

	return (
		<div>
			<RandomBackground />
			{allData.map(([a, b]) => !!a && !!b).andThen(<RealDashboard />, <Loading />)}
		</div>
	)
}
