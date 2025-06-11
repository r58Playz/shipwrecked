import type { Component, DLBasePointer } from "dreamland/core";
import { calculateProgress, calculateShells, getTotalHours, type MinimalProject, type UserStatus } from "./api";
import { Card } from "../ui/Card";

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
			<img src={use(this.user).map(x => x?.image)} />
			{use(this.user).map(x => x?.name)}
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
