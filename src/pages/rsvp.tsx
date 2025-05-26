import { type Component, type DLBoundPointer } from "dreamland/core";

import { ScrollingBackground } from "../animation";
import { Button } from "../ui/Button";
import { BackIcon } from "../ui/Icon";
import { Card } from "../ui/Card";

import rsvp from "./rsvp.webp";

export const RsvpPage: Component<{
	animationRoot: HTMLElement,
	root: DLBoundPointer<HTMLElement>,
	"on:back": () => void,
}> = function(cx) {
	cx.css = `
		.content {
			height: 100vh;
			padding: 1em;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	`;

	return (
		<div id="shore">
			<ScrollingBackground animation="top" animationRoot={this.animationRoot}>
				<img src={rsvp} alt="RSVP Background" loading="lazy" />
				<div class="content" this={use(this.root).bind()}>
					<div>
						<Card title="Log In">
							<Button on:click={this["on:back"]} label="Back"><BackIcon /></Button>
						</Card>
					</div>
				</div>
			</ScrollingBackground>
		</div>
	)
}
