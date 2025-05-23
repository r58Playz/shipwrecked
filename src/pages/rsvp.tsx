import { type Component, type DLBoundPointer } from "dreamland/core";

import { ScrollingBackground } from "../animation";

import rsvp from "./rsvp.webp";
import { BackIcon, Button } from "../Button";
import { Card } from "../Card";

export const RsvpPage: Component<{
	animationRoot: HTMLElement,
	root: DLBoundPointer<HTMLElement>,
	"on:back": () => void,
}> = function(cx) {
	cx.css = `
		.content {
			height: 100vh;
			padding: min(3rem, 5vh) min(7.5rem, 10vw);
			display: flex;
			flex-direction: column;
			align-items: left;
			justify-content: start;
		}
	`;

	return (
		<div id="shore">
			<ScrollingBackground animation="top" animationRoot={this.animationRoot}>
				<img src={rsvp} alt="RSVP Background" loading="lazy" />
				<div class="content" this={use(this.root).bind()}>
					<div>
						<Card title="RSVP">
							<div>This is only a demo, not the real site! Go to shipwrecked.hackclub.com to sign up</div>
							<Button on:click={this["on:back"]} label="Back"><BackIcon /></Button>
						</Card>
					</div>
				</div>
			</ScrollingBackground>
		</div>
	)
}
