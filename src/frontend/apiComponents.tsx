import type { Component } from "dreamland/core";
import { userInfo } from "./api";

export const UserName: Component = function(cx) {
	cx.css = `
		img {
			width: 2rem;
			height: 2rem;
			vertical-align: middle;

			margin-right: 0.25rem;

			border: 2px solid white;
			border-radius: 100%;
		}

		.chip {
			background: white;
			padding: 0 0.5rem;
			border-radius: 2rem;

			margin-left: 0.25rem;
			vertical-align: 10%;

			text-transform: uppercase;
			font-size: 0.8rem;
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
