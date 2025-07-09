import { type Component } from "dreamland/core";

import { ScrollingBackground } from "../animation";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { BackIcon, ForwardIcon } from "../ui/Icon";

import bay from "./bay.webp";

export const BayPage: Component<
	{
		animationRoot: HTMLElement;
		top: HTMLElement;
		bottom: HTMLElement;
		"on:back": () => void;
		"on:next": () => void;
	},
	{
		middle: HTMLElement;
	}
> = function () {
	return (
		<div id="bay">
			<ScrollingBackground animation="both" animationRoot={this.animationRoot}>
				<img class="bay" src={bay} alt="Bay Background" loading="lazy" />
				<div class="foreground">
					<div class="page" this={use(this.top).bind()}>
						<div>
							<Card title="The Bay, Part 1">
								Through <b>The Bay</b>, you'll earn an invitation to
								Shipwrecked. In The Bay, you will spend 60 hours making 4
								projects (about 15 hours each) with the goal of making them{" "}
								<b>go viral</b>.
							</Card>
							<div class="buttons">
								<Button on:click={this["on:back"]} label="Back">
									<BackIcon />
								</Button>
								<Button
									on:click={() =>
										this.middle.scrollIntoView({ block: "center" })
									}
								>
									What is "going viral"? <ForwardIcon />
								</Button>
							</div>
						</div>
					</div>
					<div class="page" this={use(this.middle).bind()}>
						<div>
							<Card title="The Bay, Part 2">
								Going viral means making really polished projects you are
								extremely proud of, which you then promote to get other people
								to check it out! You can find the criteria for virality{" "}
								<u>here</u>. Once you reach 60 hours, ship 4 projects, and one
								of your projects has gone viral, you'll receive an invitation to
								Shipwrecked!
							</Card>
							<div class="buttons">
								<Button
									on:click={() => this.top.scrollIntoView({ block: "center" })}
									label="Back"
								>
									<BackIcon />
								</Button>
								<Button
									on:click={() =>
										this.bottom.scrollIntoView({ block: "center" })
									}
								>
									How can I meet my team? <ForwardIcon />
								</Button>
							</div>
						</div>
					</div>
					<div class="page" this={use(this.bottom).bind()}>
						<div>
							<Card title="The Bay, Part 3">
								Every week, you can meet up with your friends either in person
								or over <u>The Pier</u>, our video game-like digital meeting
								space to work!
							</Card>
							<div class="buttons">
								<Button
									on:click={() =>
										this.middle.scrollIntoView({ block: "center" })
									}
									label="Back"
								>
									<BackIcon />
								</Button>
								<Button on:click={this["on:next"]}>
									I have more questions! <ForwardIcon />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</ScrollingBackground>
		</div>
	);
};
BayPage.css = `
	.bay {
		object-position: right top;
	}

	.foreground {
		width: 100%;
	}
	.page {
		height: 100vh;
		display: flex;
		align-items: end;
		justify-content: right;
	}
	.page > div {
		max-width: 60rem;
		padding: 0 1.5rem;

		display: flex;
		flex-direction: column;
		gap: 1rem;

		margin-bottom: 6rem;
	}

	.buttons {
		display: flex;
		gap: 1rem;
		justify-content: end;
	}
`;
