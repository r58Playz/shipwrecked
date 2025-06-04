import type { Component } from "dreamland/core";
import { userInfo } from "./api";
import { Card } from "../ui/Card";

export const UserName: Component = function(cx) {
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
		<span>
			<img src={use(userInfo.data).map(x => x?.image)} />
			{use(userInfo.data).map(x => x?.name)}
			<span class={use(userInfo.data).map(x => `chip ${x?.status}`)}>{use(userInfo.data).map(x => x?.status)}</span>
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
