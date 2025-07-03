import type { Component } from "dreamland/core";

import { fetchReviews, submitReview, type Review } from "./api";
import { RandomBackground } from "./background";
import { Loading, UserName } from "./apiComponents";
import { Button } from "../ui/Button";
import { router } from "../main";
import { BackIcon, ForwardIcon } from "../ui/Icon";
import { Card } from "../ui/Card";

const RealReviews: Component<
	{ review: Review[]; "on:submit": (comment: string) => Promise<void> },
	{ comment: string }
> = function (cx) {
	cx.css = `
		:scope {
			padding: 1em;
			display: flex;
			flex-direction: column;
			align-items: start;
			gap: 1em;

			overflow: scroll;
		}

		:scope > :global(:first-child) {
			align-self: center;
		}

		.comment {
			white-space: pre-wrap;
			word-break: break-all;
		}

		.reviewbox {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		.reviewbox textarea {
			min-height: 8rem;

			background: #f3f4f6;
			outline: 1px solid #e5e7eb;
			border: none;
			border-radius: 4px;

			font-family: Poppins;
			font-size: 18px;

			padding: 0.5rem;
		}
	`;

	this.comment = "";

	return (
		<div>
			<Card title="Project Reviews" />
			<Card title="Write a Review" project={true}>
				<div class="reviewbox">
					<textarea value={use(this.comment).bind()} />
					<div>
						<b>
							THIS DOES NOT MARK THE PROJECT FOR REVIEW! USE THE OFFICIAL SITE
							TO DO THAT!
						</b>
						<Button
							on:click={async () => {
								await this["on:submit"](this.comment);
								this.comment = "";
							}}
						>
							Submit
							<ForwardIcon />
						</Button>
					</div>
				</div>
			</Card>
			{use(this.review).mapEach((x) => (
				<Card
					title={<UserName user={x.reviewer} />}
					project={true}
				>
					<div class="comment">{x.comment}</div>
				</Card>
			))}
		</div>
	);
};

export const Reviews: Component<
	{ project?: string; location?: string },
	{ review?: Review[] },
	{ "on:routeshown": () => void }
> = function (cx) {
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

	this.review = undefined;
	this.project = undefined;

	const reload = async () => {
		this.review = undefined;
		if (this.project) {
			let x = await fetchReviews(this.project);
			this.review = x;
		}
	};
	this["on:routeshown"] = reload;
	const submit = async (comment: string) => {
		await submitReview(this.project!, comment);
		await reload();
	};

	return (
		<div>
			<RandomBackground />
			{use(this.review).andThen(
				(x: Review[]) => (
					<RealReviews review={x} on:submit={submit} />
				),
				<Loading />
			)}
			<div class="logout-container">
				<Button
					on:click={() => {
						router.navigate("/" + this.location);
					}}
				>
					<BackIcon />
					Back
				</Button>
			</div>
		</div>
	);
};
