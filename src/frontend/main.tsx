import type { Component } from "dreamland/core";

import { RandomBackground } from "./background";
import {
	clearCache,
	deleteToken,
	fetchInfo,
	fetchProjects,
	userInfo,
} from "./api";
import { DashboardComponent, Loading } from "./apiComponents";
import { Button } from "../ui/Button";
import { BackIcon, ForwardIcon } from "../ui/Icon";
import { router } from "../main";

export const Dashboard: Component<{}, {}, { "on:routeshown": () => void }> =
	function () {
		let allData = use(userInfo.data).zip(use(userInfo.projects));

		this["on:routeshown"] = async () => {
			clearCache();
			await fetchInfo();
			await fetchProjects();
		};

		return (
			<div>
				<RandomBackground />
				{allData
					.map(([a, b]) => !!a && !!b)
					.andThen(
						() => (
							<DashboardComponent
								user={userInfo.data!}
								projects={userInfo.projects!}
							/>
						),
						<Loading />
					)}
				<div class="logout-container">
					<Button
						on:click={() => {
							deleteToken();
							router.navigate("/");
						}}
					>
						<BackIcon />
						Log Out
					</Button>
					<Button
						on:click={() => {
							router.navigate("/gallery");
						}}
					>
						Gallery
						<ForwardIcon />
					</Button>
				</div>
			</div>
		);
	};
Dashboard.css = `
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
