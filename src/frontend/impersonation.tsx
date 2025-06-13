import type { Component } from "dreamland/core";

import { fetchGallery, fetchReviews, submitReview, userInfo, type Review } from "./api";
import { RandomBackground } from "./background";
import { DashboardComponent, Loading } from "./apiComponents";
import { Button } from "../ui/Button";
import { router } from "../main";
import { BackIcon } from "../ui/Icon";
import { galleryToUsers, type GalleryUser } from "./scamming";

export const Impersonation: Component<{ user?: string }, { data?: GalleryUser }, { "on:routeshown": () => void }> = function(cx) {
	cx.css = `
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

	this.user = undefined;

	const reload = async () => {
		this.data = undefined;
		await fetchGallery();
		if (this.user && userInfo.gallery) {
			let x = galleryToUsers(userInfo.gallery).find(x => x.user.id === this.user);
			if (x)
				this.data = x;
		}
	}
	this["on:routeshown"] = reload;

	return (
		<div>
			<RandomBackground />
			{use(this.data).andThen((x: GalleryUser) => <DashboardComponent user={x.user} projects={x.projects} />, <Loading />)}
			<div class="logout-container">
				<Button on:click={() => { router.navigate("/scamming") }}><BackIcon />Back</Button>
			</div>
		</div>
	)
}
