import type { Component } from "dreamland/core";

import { fetchGallery, userInfo, type UserWithProjects } from "./api";
import { RandomBackground } from "./background";
import { DashboardComponent, Loading } from "./apiComponents";
import { Button } from "../ui/Button";
import { router } from "../main";
import { BackIcon } from "../ui/Icon";

export const Impersonation: Component<
	{ user?: string },
	{ data?: UserWithProjects },
	{ "on:routeshown": () => void }
> = function () {
	this.user = undefined;

	const reload = async () => {
		this.data = undefined;
		await fetchGallery();
		if (this.user && userInfo.users) {
			let x = userInfo.users.find((x) => x.user.id === this.user);
			if (x) this.data = x;
		}
	};
	this["on:routeshown"] = reload;

	return (
		<div>
			<RandomBackground />
			{use(this.data).andThen(
				(x: UserWithProjects) => (
					<DashboardComponent user={x.user} projects={x.projects} />
				),
				<Loading />
			)}
			<div class="logout-container">
				<Button
					on:click={() => {
						router.navigate("/scamming");
					}}
				>
					<BackIcon />
					Back
				</Button>
			</div>
		</div>
	);
};
Impersonation.css = `
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
