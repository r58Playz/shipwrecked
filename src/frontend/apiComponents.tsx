import type { Component, DLBasePointer } from "dreamland/core";
import { type User, type UserStatus } from "./api";
import { Card } from "../ui/Card";

type UserNameUser = User & { status?: UserStatus } | null;
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
		<span>
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
